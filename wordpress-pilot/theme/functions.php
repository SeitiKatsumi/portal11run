<?php

add_action('after_setup_theme', function () {
    add_theme_support('title-tag');
    add_theme_support('automatic-feed-links');
    add_theme_support('custom-logo');
    add_theme_support('html5', ['search-form', 'style', 'script']);
    register_nav_menus(['primary' => 'Menu 11RUN', 'footer' => 'Rodapé 11RUN']);
});

add_action('wp_enqueue_scripts', function () {
    wp_enqueue_style('onze-piloto', get_stylesheet_uri(), [], wp_get_theme()->get('Version'));
});

add_action('elementor/theme/register_locations', function ($manager) {
    $manager->register_all_core_location();
});

function onze_elementor_shell(string $part): bool {
    if (function_exists('elementor_theme_do_location') && elementor_theme_do_location($part)) {
        return true;
    }
    $id = (int) get_option('_onze_elementor_' . $part);
    if (!$id || get_post_status($id) !== 'publish' || !did_action('elementor/loaded')) {
        return false;
    }
    $html = \Elementor\Plugin::$instance->frontend->get_builder_content_for_display($id, true);
    if (!$html) {
        return false;
    }
    echo $part === 'header' ? '<header>' . $html . '</header>' : '<footer>' . $html . '</footer>';
    return true;
}
