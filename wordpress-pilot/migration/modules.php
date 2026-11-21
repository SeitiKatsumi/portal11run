<?php

defined('ABSPATH') || exit;

const ONZE_CADASTRO = 'onze_cadastro';
const ONZE_SCRIPT = 'onze_script';

add_action('init', static function () {
    foreach ([ONZE_CADASTRO => 'Cadastros 11RUN', ONZE_SCRIPT => 'Biblioteca JavaScript'] as $type => $label) {
        $read_only = $type === ONZE_CADASTRO;
        $caps = array_fill_keys([
            'edit_post', 'read_post', 'delete_post', 'edit_posts', 'edit_others_posts',
            'publish_posts', 'read_private_posts', 'delete_posts', 'delete_private_posts',
            'delete_published_posts', 'delete_others_posts', 'edit_private_posts', 'edit_published_posts',
        ], 'manage_options');
        $caps['create_posts'] = $read_only ? 'do_not_allow' : 'manage_options';
        register_post_type($type, [
            'label' => $label,
            'public' => false,
            'show_ui' => true,
            'show_in_rest' => false,
            'rewrite' => false,
            'query_var' => false,
            'capabilities' => $caps,
            'supports' => $read_only ? ['title'] : ['title', 'editor', 'revisions'],
            'menu_icon' => $read_only ? 'dashicons-id' : 'dashicons-editor-code',
        ]);
    }
});

function onze_registration_projects(): array {
    return ['onze-futuro' => 'Onze Futuro', '11-master' => '11 Master', 'circuito-futuro-11' => 'Circuito Futuro 11', 'bolsas' => 'Bolsas e oportunidades'];
}

function onze_post_value(string $key): string {
    return is_string($_POST[$key] ?? null) ? wp_unslash($_POST[$key]) : '';
}

add_shortcode('onze_cadastro', static function (): string {
    if (!is_singular('page')) {
        return '';
    }
    $feedback = sanitize_key(is_string($_GET['cadastro'] ?? null) ? $_GET['cadastro'] : '');
    ob_start();
    ?>
    <div class="onze-registration">
        <p><strong>Ambiente de teste.</strong> Use dados fictícios aqui. Os cadastros oficiais continuam no <a href="https://11run.com.br/">portal atual</a>.</p>
        <?php if ($feedback) : ?>
            <p role="status"><?php echo $feedback === 'ok' ? 'Cadastro de teste recebido.' : 'Não foi possível registrar. Confira os campos e tente novamente.'; ?></p>
        <?php endif; ?>
        <form action="<?php echo esc_url(rest_url('onze/v1/cadastros')); ?>" method="post" data-onze-registration>
            <?php wp_nonce_field('wp_rest', '_wpnonce', false); ?>
            <?php wp_nonce_field('onze_register', '_onze_nonce', false); ?>
            <p><label>Nome de teste <input name="person" type="text" maxlength="120" required autocomplete="name"></label></p>
            <p><label>E-mail de teste <input name="email" type="email" maxlength="160" required autocomplete="email"></label></p>
            <p><label>Projeto <select name="project" required>
                <?php foreach (onze_registration_projects() as $slug => $label) : ?>
                    <option value="<?php echo esc_attr($slug); ?>"><?php echo esc_html($label); ?></option>
                <?php endforeach; ?>
            </select></label></p>
            <p hidden><label>Deixe este campo vazio <input name="website" type="text" tabindex="-1" autocomplete="off"></label></p>
            <button type="submit">Registrar teste</button>
        </form>
        <p><a href="<?php echo esc_url(home_url('/politica-de-privacidade/')); ?>">Política de Privacidade</a></p>
    </div>
    <?php
    return (string) ob_get_clean();
});

function onze_save_registration(): WP_REST_Response|WP_Error {
    if (!wp_verify_nonce(sanitize_text_field(onze_post_value('_onze_nonce')), 'onze_register')) {
        return new WP_Error('onze_invalid_submission', 'Não foi possível validar o envio.', ['status' => 403]);
    }
    $name = sanitize_text_field(onze_post_value('person'));
    $email = sanitize_email(onze_post_value('email'));
    $project = sanitize_key(onze_post_value('project'));
    $ok = false;
    if (wp_get_environment_type() === 'staging' && empty($_POST['website']) && $name &&
        strlen($name) <= 120 && strlen($email) <= 160 && is_email($email) && isset(onze_registration_projects()[$project])) {
        $id = wp_insert_post([
            'post_type' => ONZE_CADASTRO, 'post_status' => 'private', 'post_title' => wp_slash($name),
            'meta_input' => ['onze_email' => $email, 'onze_project' => $project],
        ], true);
        $ok = !is_wp_error($id) && $id > 0;
    }
    return new WP_REST_Response(null, 303, [
        'Location' => add_query_arg('cadastro', $ok ? 'ok' : 'erro', home_url('/cadastros/')),
    ]);
}
add_action('rest_api_init', static function (): void {
    register_rest_route('onze/v1', '/cadastros', [
        'methods' => WP_REST_Server::CREATABLE,
        'permission_callback' => '__return_true',
        'callback' => 'onze_save_registration',
    ]);
});

add_filter('manage_onze_cadastro_posts_columns', static function (array $columns): array {
    return array_slice($columns, 0, 2, true) + ['onze_email' => 'E-mail', 'onze_project' => 'Projeto'] + $columns;
});
add_action('manage_onze_cadastro_posts_custom_column', static function (string $column, int $id): void {
    if ($column === 'onze_email') {
        echo esc_html(get_post_meta($id, 'onze_email', true));
    } elseif ($column === 'onze_project') {
        $project = get_post_meta($id, 'onze_project', true);
        echo esc_html(onze_registration_projects()[$project] ?? $project);
    }
}, 10, 2);

add_filter('user_can_richedit', static function (bool $allowed): bool {
    return function_exists('get_current_screen') && get_current_screen()?->post_type === ONZE_SCRIPT ? false : $allowed;
});

add_action('wp_enqueue_scripts', static function () {
    $assets = plugin_dir_url(__FILE__);
    wp_enqueue_script('onze-portal', $assets . 'portal.js', [], '1.0.0', true);
    if (is_singular('page')) {
        if (get_post_meta(get_queried_object_id(), '_onze_migrated', true)) {
            wp_enqueue_style('onze-editorial-import', $assets . 'legacy.css', [], '1.0.0');
        }
        foreach (get_posts(['post_type' => ONZE_SCRIPT, 'post_status' => 'publish', 'numberposts' => -1]) as $snippet) {
            $author = get_user_by('id', $snippet->post_author);
            if ($author && user_can($author, 'manage_options') && user_can($author, 'unfiltered_html') &&
                !preg_match('/<\s*\/?\s*script\b/i', $snippet->post_content)) {
                wp_add_inline_script('onze-portal', $snippet->post_content, 'after');
            }
        }
    }
});

add_shortcode('onze_menu', static function ($input): string {
    $area = ($input['area'] ?? '') === 'footer' ? 'footer' : 'primary';
    $menu = static fn(string $id): string => (string) wp_nav_menu([
        'theme_location' => $area, 'menu_id' => $id, 'container' => false, 'fallback_cb' => false, 'echo' => false,
    ]);
    if ($area === 'footer') {
        return '<nav aria-label="Links institucionais">' . $menu('onze-footer-links') . '</nav>';
    }
    return '<nav class="pilot-nav-desktop" aria-label="Navegação principal">' . $menu('onze-primary-links') . '</nav>'
        . '<details class="pilot-nav-mobile"><summary>Menu</summary><nav aria-label="Navegação principal">'
        . $menu('onze-mobile-links') . '</nav></details>';
});
