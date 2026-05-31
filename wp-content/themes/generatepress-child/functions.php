<?php
if ( ! defined( 'ABSPATH' ) ) exit;

// 載入父主題樣式
add_action( 'wp_enqueue_scripts', function() {
    wp_enqueue_style(
        'generatepress-parent-style',
        get_template_directory_uri() . '/style.css'
    );
} );

// 排盤頁面專用資源
add_action( 'wp_enqueue_scripts', function() {
    if ( ! is_page_template( 'page-panlou.php' ) ) return;

    wp_enqueue_style(
        'panlou-style',
        get_stylesheet_directory_uri() . '/assets/css/panlou.css',
        [], '1.0.0'
    );

    wp_enqueue_script(
        'astronomy-engine',
        get_stylesheet_directory_uri() . '/assets/js/astronomy.browser.min.js',
        [], '2.1.19', true
    );

    wp_enqueue_script(
        'panlou-script',
        get_stylesheet_directory_uri() . '/assets/js/panlou.js',
        [ 'astronomy-engine' ], '1.0.0', true
    );
} );

// 排盤頁面：移除 GeneratePress 的內容容器寬度限制
add_filter( 'generate_sidebar_layout', function( $layout ) {
    if ( is_page_template( 'page-panlou.php' ) ) return 'no-sidebar';
    return $layout;
} );

add_filter( 'generate_content_class', function( $classes ) {
    if ( is_page_template( 'page-panlou.php' ) ) {
        return array_filter( $classes, fn($c) => $c !== 'grid-container' );
    }
    return $classes;
} );
