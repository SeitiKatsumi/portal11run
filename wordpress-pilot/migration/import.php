<?php
/**
 * Plugin Name: 11RUN · Migração do portal
 * Description: Importa conteúdo editorial e organiza os módulos do WordPress em /global.
 * Version: 1.0.0
 */

defined('ABSPATH') || exit;
require_once __DIR__ . '/modules.php';

function onze_widget(string $type, array $settings): array {
    return ['id' => wp_generate_password(7, false), 'elType' => 'widget', 'widgetType' => $type, 'isInner' => false, 'settings' => $settings, 'elements' => []];
}

function onze_container(array $widgets, array $settings = []): array {
    return ['id' => wp_generate_password(7, false), 'elType' => 'container', 'isInner' => false, 'settings' => $settings + ['content_width' => 'full'], 'elements' => $widgets];
}

function onze_save_elementor(int $id, array $elements): void {
    $doc = \Elementor\Plugin::$instance->documents->get($id, false);
    if (!$doc) {
        throw new RuntimeException("Documento Elementor indisponível: $id.");
    }
    $doc->set_is_built_with_elementor(true);
    if (!$doc->save(['elements' => $elements, 'settings' => ['hide_title' => 'yes']])) {
        throw new RuntimeException("O Elementor não salvou o documento $id.");
    }
}

function onze_shared_template(string $part, int $logo): int {
    $key = '_onze_elementor_' . $part;
    if ($id = (int) get_option($key)) {
        return $id;
    }
    $is_header = $part === 'header';
    $template_type = class_exists(\ElementorPro\Modules\ThemeBuilder\Module::class) ? $part : 'section';
    $title = $is_header ? '11RUN · Cabeçalho global' : '11RUN · Rodapé global';
    $slug = $is_header ? '11run-cabecalho-global' : '11run-rodape-global';
    $existing = get_page_by_path($slug, OBJECT, 'elementor_library');
    $id = $existing?->ID ?: wp_insert_post([
        'post_title' => $title, 'post_name' => $slug, 'post_type' => 'elementor_library', 'post_status' => 'draft',
        'meta_input' => ['_elementor_template_type' => $template_type],
        'tax_input' => ['elementor_library_type' => [$template_type]],
    ], true);
    if (is_wp_error($id)) {
        throw new RuntimeException($id->get_error_message());
    }
    $widgets = $is_header ? [
        onze_widget('image', ['image' => ['id' => $logo, 'url' => wp_get_attachment_url($logo)], 'link_to' => 'custom', 'link' => ['url' => home_url('/')]]),
        onze_widget('shortcode', ['shortcode' => '[onze_menu area="primary"]']),
    ] : [
        onze_widget('heading', ['title' => '11RUN Brazil', 'header_size' => 'p']),
        onze_widget('shortcode', ['shortcode' => '[onze_menu area="footer"]']),
    ];
    onze_save_elementor($id, [onze_container($widgets, [
        'css_classes' => $is_header ? 'pilot-shell pilot-header' : 'pilot-shell pilot-footer',
        'flex_direction' => 'row', 'flex_justify_content' => 'space-between', 'flex_align_items' => 'center',
    ])]);
    wp_publish_post($id);
    update_post_meta($id, '_elementor_conditions', ['include/general']);
    if ($template_type === $part) {
        $manager = \ElementorPro\Modules\ThemeBuilder\Module::instance()->get_conditions_manager();
        if (is_callable([$manager, 'save_conditions'])) {
            $manager->save_conditions($id, ['include/general']);
        }
    }
    update_option($key, $id);
    return $id;
}

function onze_page(string $path, string $title, ?array $widgets): bool {
    $slug = trim($path, '/');
    $existing = get_page_by_path($slug, OBJECT, 'page');
    if ($existing && ($existing->post_status !== 'draft' || !get_post_meta($existing->ID, '_onze_migration_draft', true))) {
        return false;
    }
    if (!preg_match('#^[a-z0-9-]+(?:/[a-z0-9-]+)*$#', $slug)) {
        throw new RuntimeException('Caminho editorial inválido.');
    }
    $parts = explode('/', $slug);
    $name = array_pop($parts);
    $parent_slug = implode('/', $parts);
    $parent = 0;
    if ($parent_slug) {
        if (!get_page_by_path($parent_slug)) {
            onze_page($parent_slug, ucwords(str_replace('-', ' ', basename($parent_slug))), null);
        }
        $parent = (int) get_page_by_path($parent_slug)?->ID;
    }
    $id = $existing?->ID ?: wp_insert_post([
        'post_title' => $title, 'post_name' => $name, 'post_type' => 'page', 'post_status' => 'draft',
        'post_parent' => $parent, 'meta_input' => ['_onze_migration_draft' => true],
    ], true);
    if (is_wp_error($id)) {
        throw new RuntimeException($id->get_error_message());
    }
    if (!$widgets) {
        $official = 'https://11run.com.br/' . $slug;
        $widgets = [onze_container([
            onze_widget('heading', ['title' => $title, 'header_size' => 'h1']),
            onze_widget('button', ['text' => 'Abrir no portal oficial', 'link' => ['url' => $official]]),
        ])];
    }
    onze_save_elementor($id, $widgets);
    update_post_meta($id, '_onze_migrated', true);
    wp_publish_post($id);
    return true;
}

function onze_migration_batch(int $offset): array {
    if (wp_get_environment_type() !== 'staging' || !current_user_can('manage_options') || !current_user_can('unfiltered_html')) {
        throw new RuntimeException('A migração é restrita a administradores do ambiente de teste.');
    }
    if (!did_action('elementor/loaded')) {
        throw new RuntimeException('Ative o Elementor antes de importar.');
    }
    $bundle = __DIR__ . '/generated/content.json';
    $pages = is_readable($bundle) ? json_decode(file_get_contents($bundle), true) : null;
    if (!is_array($pages)) {
        throw new RuntimeException('Pacote de conteúdo ausente ou inválido.');
    }
    $editorial = array_values(array_filter($pages, static fn(array $page): bool => isset($page['blocks'])));
    if ($offset === 0) {
        if (get_option('show_on_front') !== 'page' || !get_option('page_on_front')) {
            onze_pilot_setup();
        }
        if (get_stylesheet() === 'onze-piloto' && wp_get_theme('onze-portal')->exists()) {
            $menu_locations = get_nav_menu_locations();
            $custom_logo = (int) get_theme_mod('custom_logo');
            switch_theme('onze-portal');
            set_theme_mod('nav_menu_locations', $menu_locations);
            set_theme_mod('custom_logo', $custom_logo);
        }
        $logo = onze_pilot_media('onzerun-menu.png', 'Marca 11RUN', '11RUN');
        onze_shared_template('header', $logo);
        onze_shared_template('footer', $logo);
        onze_page('/cadastros', 'Cadastros 11RUN', [onze_container([
            onze_widget('heading', ['title' => 'Cadastros 11RUN', 'header_size' => 'h1']),
            onze_widget('shortcode', ['shortcode' => '[onze_cadastro]']),
        ])]);
    }
    $created = 0;
    // Import parents first so nested permalinks are stable and no placeholders shadow actual pages.
    usort($editorial, static fn($a, $b) => (substr_count($a['path'], '/') <=> substr_count($b['path'], '/')) ?: strcmp($a['path'], $b['path']));
    $batch = array_slice($editorial, $offset, 5);
    foreach ($batch as $page) {
        $widgets = array_map(static fn(string $html): array => onze_container(
            [onze_widget('html', ['html' => $html])], ['css_classes' => 'onze-import']
        ), $page['blocks']);
        if (isset($page['wrapper'])) {
            $rows = array_map(static function (array $row): array {
                $row['isInner'] = true;
                $row['settings']['css_classes'] = 'onze-row';
                return $row;
            }, $widgets);
            $widgets = [onze_container($rows, ['css_classes' => 'onze-import ' . $page['wrapper']])];
        }
        $created += (int) onze_page($page['path'], $page['title'], $widgets);
    }
    $next = min(count($editorial), $offset + count($batch));
    if ($next >= count($editorial)) {
        $menus = get_nav_menu_locations();
        if (!empty($menus['primary']) && !get_option('_onze_migration_menu_done')) {
            $local = array_fill_keys(array_column($editorial, 'path'), true);
            foreach (['primary', 'footer'] as $area) {
                foreach (wp_get_nav_menu_items($menus[$area] ?? 0) ?: [] as $item) {
                    $url = wp_parse_url($item->url);
                    $path = rtrim($url['path'] ?? '', '/');
                    if ($item->type === 'custom' && ($url['host'] ?? '') === '11run.com.br' && isset($local[$path])) {
                        update_post_meta($item->ID, '_menu_item_url', wp_slash(home_url($path . '/')));
                    }
                }
            }
            onze_pilot_menu('Menu 11RUN', ['Cadastro de teste' => home_url('/cadastros/')]);
            update_option('_onze_migration_menu_done', true);
        }
    }
    return ['created' => $created, 'next' => $next, 'total' => count($editorial), 'external' => count($pages) - count($editorial)];
}

add_action('admin_menu', static function () {
    add_management_page('Migração 11RUN', 'Migração 11RUN', 'manage_options', 'onze-migration', static function () {
        echo '<div class="wrap"><h1>Migração 11RUN</h1><p>Importa por lotes; os documentos existentes não são sobrescritos.</p>';
        foreach (['header' => 'Cabeçalho Elementor', 'footer' => 'Rodapé Elementor'] as $part => $label) {
            if ($id = get_option('_onze_elementor_' . $part)) {
                echo '<p><a href="' . esc_url(add_query_arg(['post' => $id, 'action' => 'elementor'], admin_url('post.php'))) . '">' . esc_html($label) . '</a></p>';
            }
        }
        echo '<form method="post" action="' . esc_url(admin_url('admin-post.php')) . '">';
        wp_nonce_field('onze_migrate');
        echo '<input type="hidden" name="action" value="onze_migrate">';
        echo '<input type="hidden" name="offset" value="' . esc_attr((int) ($_GET['offset'] ?? 0)) . '">';
        submit_button('Importar próximo lote');
        echo '</form></div>';
    });
});

add_action('admin_post_onze_migrate', static function () {
    check_admin_referer('onze_migrate');
    try {
        $result = onze_migration_batch(max(0, (int) ($_POST['offset'] ?? 0)));
        if (isset($_POST['json'])) {
            wp_send_json_success($result);
        }
        wp_safe_redirect(add_query_arg(['page' => 'onze-migration', 'offset' => $result['next']], admin_url('tools.php')));
        exit;
    } catch (Throwable $error) {
        wp_send_json_error(['message' => $error->getMessage()], 400);
    }
});
