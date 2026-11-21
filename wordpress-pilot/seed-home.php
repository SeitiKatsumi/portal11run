<?php
/**
 * Plugin Name: 11RUN · Configuração do piloto
 * Description: Cria a home editável e os menus em uma instalação isolada.
 */

defined('ABSPATH') || exit;

function onze_pilot_media(string $filename, string $title, string $alt): int {
    $existing = get_posts([
        'post_type' => 'attachment', 'post_status' => 'inherit', 'fields' => 'ids',
        'numberposts' => 1, 'meta_key' => '_11run_pilot_asset', 'meta_value' => $filename,
    ]);
    if ($existing) {
        return (int) $existing[0];
    }

    require_once ABSPATH . 'wp-admin/includes/file.php';
    require_once ABSPATH . 'wp-admin/includes/media.php';
    require_once ABSPATH . 'wp-admin/includes/image.php';
    $temp = wp_tempnam($filename);
    if (!$temp || !copy('/opt/11run-pilot/media/' . $filename, $temp)) {
        if ($temp) {
            wp_delete_file($temp);
        }
        throw new RuntimeException('Não foi possível copiar a mídia do piloto.');
    }
    $id = media_handle_sideload(['name' => $filename, 'tmp_name' => $temp], 0, $title);
    if (is_wp_error($id)) {
        wp_delete_file($temp);
        throw new RuntimeException($id->get_error_message());
    }
    update_post_meta($id, '_11run_pilot_asset', $filename);
    update_post_meta($id, '_wp_attachment_image_alt', $alt);
    return $id;
}

function onze_pilot_menu(string $name, array $links): int {
    $menu = wp_get_nav_menu_object($name);
    $id = $menu ? (int) $menu->term_id : wp_create_nav_menu($name);
    if (is_wp_error($id)) {
        throw new RuntimeException($id->get_error_message());
    }

    $items = wp_get_nav_menu_items($id);
    foreach ($links as $label => $url) {
        if (array_filter($items ?: [], static fn($item) => $item->title === $label)) {
            continue;
        }
        $item = wp_update_nav_menu_item($id, 0, [
            'menu-item-title' => $label, 'menu-item-url' => $url, 'menu-item-status' => 'publish',
        ]);
        if (is_wp_error($item)) {
            throw new RuntimeException($item->get_error_message());
        }
    }
    return $id;
}

function onze_pilot_setup(): int {
    if (wp_get_environment_type() !== 'staging' || !current_user_can('manage_options')) {
        throw new RuntimeException('A operação exige um administrador do ambiente de teste.');
    }
    if ($ready = (int) get_option('onze_pilot_home')) {
        if (get_post_status($ready) !== 'publish') {
            throw new RuntimeException('A home do piloto não está publicada. Confira a página antes de continuar.');
        }
        return $ready;
    }

    $current = get_page_by_path('home-11run');
    if ((get_option('show_on_front') === 'page' && (int) get_option('page_on_front')) ||
        ($current && ($current->post_status !== 'draft' || !get_post_meta($current->ID, '_11run_pilot_draft', true)))) {
        throw new RuntimeException('Já existe uma home configurada. A inicialização não sobrescreve páginas existentes.');
    }

    if (!did_action('elementor/loaded')) {
        throw new RuntimeException('Instale e ative o Elementor antes de preparar a home.');
    }

    $logo = onze_pilot_media('onzerun-menu.png', 'Marca 11RUN', '11RUN');
    $photo = onze_pilot_media('time-2027.webp', 'Equipe 11RUN na pista', 'Atletas da equipe 11RUN reunidos na pista de atletismo.');
    $live = 'https://11run.com.br';
    $primary = onze_pilot_menu('Menu 11RUN', [
        'Home' => home_url('/'), 'Onze Futuro' => $live . '/onze-futuro',
        'Desafios' => $live . '/projetos/circuito-virtual-11run',
        'Eventos' => $live . '/eventos/finalissima-desafio-virtual-2026',
        'Circuito 11 Run 2027' => $live . '/circuito-futuro-11',
        'Institucional' => $live . '/institucional/missao-visao-valores',
        'Referências' => $live . '/referencias/ranking-brasil',
        'Apoie o projeto' => $live . '/apoie', 'Login' => $live . '/login',
    ]);
    $footer = onze_pilot_menu('Rodapé 11RUN', [
        'Política de Privacidade' => $live . '/politica-de-privacidade',
        'Termos de Uso' => $live . '/termos-de-uso',
    ]);

    switch_theme('onze-piloto');
    set_theme_mod('custom_logo', $logo);
    set_theme_mod('nav_menu_locations', ['primary' => $primary, 'footer' => $footer]);
    update_option('blog_public', '0');
    update_option('blogdescription', 'Ecossistema de inteligência aplicada ao fundismo no Brasil');
    update_option('timezone_string', 'America/Sao_Paulo');
    update_option('users_can_register', '0');
    update_option('elementor_disable_color_schemes', 'yes');
    update_option('elementor_disable_typography_schemes', 'yes');

    $page = $current ? $current->ID : wp_insert_post([
        'post_type' => 'page', 'post_status' => 'draft', 'post_title' => '11RUN', 'post_name' => 'home-11run',
        'meta_input' => ['_11run_pilot_draft' => true],
    ], true);
    if (is_wp_error($page)) {
        throw new RuntimeException($page->get_error_message());
    }

    $elementor = \Elementor\Plugin::$instance;
    $document = $elementor->documents->get($page);
    $height = static fn(string $unit, int $size): array => ['unit' => $unit, 'size' => $size, 'sizes' => []];
    $hero = [
        'id' => '11f001a', 'elType' => 'container', 'isInner' => false,
        'settings' => [
            'css_classes' => 'pilot-hero', 'content_width' => 'full',
            'min_height' => $height('vh', 77), 'min_height_tablet' => $height('vh', 66),
            'min_height_mobile' => $height('vh', 72),
            'background_background' => 'classic', 'background_image' => ['id' => $photo, 'url' => wp_get_attachment_url($photo)],
            'background_position' => 'center center', 'background_position_tablet' => 'center center',
            'background_position_mobile' => 'center center', 'background_size' => 'cover',
            'background_size_mobile' => 'cover', 'background_repeat' => 'no-repeat',
        ],
        'elements' => [[
            'id' => '11f001b', 'elType' => 'widget', 'widgetType' => 'heading', 'isInner' => false, 'elements' => [],
            'settings' => ['title' => '11RUN · Fundismo no Brasil', 'header_size' => 'h1', '_css_classes' => 'pilot-visually-hidden'],
        ]],
    ];
    $document->set_is_built_with_elementor(true);
    if (!$document->save(['elements' => [$hero], 'settings' => ['hide_title' => 'yes']])) {
        throw new RuntimeException('O Elementor não conseguiu salvar a home.');
    }

    $kit = $elementor->kits_manager->get_active_kit();
    $colors = [
        ['_id' => 'primary', 'title' => 'Principal', 'color' => '#262626'],
        ['_id' => 'secondary', 'title' => 'Secundária', 'color' => '#525252'],
        ['_id' => 'text', 'title' => 'Texto', 'color' => '#262626'],
        ['_id' => 'accent', 'title' => 'Destaque', 'color' => '#ac4200'],
    ];
    $kit->update_settings(['system_colors' => $colors, 'default_generic_fonts' => 'Sans-serif']);

    wp_publish_post($page);
    update_option('show_on_front', 'page');
    update_option('page_on_front', $page);
    update_option('permalink_structure', '/%postname%/');
    update_option('onze_pilot_home', $page);
    return $page;
}

add_action('admin_menu', static function () {
    add_management_page('Home 11RUN', 'Home 11RUN', 'manage_options', 'onze-pilot-home', static function () {
        echo '<div class="wrap"><h1>Home 11RUN</h1>';
        if (!empty($_GET['pilot_error'])) {
            echo '<p role="alert">' . esc_html(sanitize_text_field(wp_unslash($_GET['pilot_error']))) . '</p>';
        }
        if ($page = (int) get_option('onze_pilot_home')) {
            $edit = add_query_arg(['post' => $page, 'action' => 'elementor'], admin_url('post.php'));
            echo '<p><a class="button button-primary" href="' . esc_url($edit) . '">Editar home com Elementor</a></p>';
        } else {
            echo '<p>Monta a home inicial e os menus. Não importa cadastros nem modifica o portal atual.</p>';
            echo '<form method="post" action="' . esc_url(admin_url('admin-post.php')) . '">';
            echo '<input type="hidden" name="action" value="onze_pilot_setup">';
            wp_nonce_field('onze_pilot_setup');
            submit_button('Preparar home');
            echo '</form>';
        }
        echo '</div>';
    });
});

add_action('admin_post_onze_pilot_setup', static function () {
    if (!current_user_can('manage_options')) {
        wp_die('Acesso restrito.', '', ['response' => 403]);
    }
    check_admin_referer('onze_pilot_setup');
    $url = admin_url('tools.php?page=onze-pilot-home');
    try {
        onze_pilot_setup();
    } catch (RuntimeException $error) {
        $url = add_query_arg('pilot_error', rawurlencode($error->getMessage()), $url);
    }
    wp_safe_redirect($url);
    exit;
});

if (defined('WP_CLI') && WP_CLI) {
    WP_CLI::add_command('11run-pilot seed', static function () {
        try {
            $id = onze_pilot_setup();
            WP_CLI::success("Home #$id pronta.");
        } catch (RuntimeException $error) {
            WP_CLI::error($error->getMessage());
        }
    });
}
