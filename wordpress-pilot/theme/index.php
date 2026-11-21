<!doctype html>
<html <?php language_attributes(); ?>>
<head>
    <meta charset="<?php bloginfo('charset'); ?>">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <?php wp_head(); ?>
</head>
<body <?php body_class(); ?>>
<?php wp_body_open(); ?>
<a class="pilot-skip" href="#conteudo">Pular para o conteúdo</a>
<?php if (!function_exists('elementor_theme_do_location') || !elementor_theme_do_location('header')) : ?>
    <header class="pilot-shell pilot-header">
        <?php if (has_custom_logo()) : ?>
            <?php the_custom_logo(); ?>
        <?php else : ?>
            <a href="<?php echo esc_url(home_url('/')); ?>">11RUN</a>
        <?php endif; ?>
        <nav class="pilot-nav-desktop" aria-label="Navegação principal">
            <?php wp_nav_menu(['theme_location' => 'primary', 'menu_id' => 'menu-11run-desktop', 'container' => false, 'fallback_cb' => false]); ?>
        </nav>
        <details class="pilot-nav-mobile">
            <summary>Menu</summary>
            <nav aria-label="Navegação principal">
                <?php wp_nav_menu(['theme_location' => 'primary', 'menu_id' => 'menu-11run-mobile', 'container' => false, 'fallback_cb' => false]); ?>
            </nav>
        </details>
    </header>
<?php endif; ?>
<main class="pilot-shell pilot-main" id="conteudo">
    <?php while (have_posts()) : the_post(); ?>
        <?php if (!is_front_page()) : ?><h1><?php the_title(); ?></h1><?php endif; ?>
        <?php the_content(); ?>
    <?php endwhile; ?>
</main>
<?php if (!function_exists('elementor_theme_do_location') || !elementor_theme_do_location('footer')) : ?>
    <footer class="pilot-shell pilot-footer">
        <span>11RUN Brazil</span>
        <nav aria-label="Links institucionais">
            <?php wp_nav_menu(['theme_location' => 'footer', 'container' => false, 'fallback_cb' => false]); ?>
        </nav>
    </footer>
<?php endif; ?>
<?php wp_footer(); ?>
</body>
</html>
