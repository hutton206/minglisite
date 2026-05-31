<?php
if ( ! defined( 'ABSPATH' ) ) exit;

// 載入父主題樣式
add_action( 'wp_enqueue_scripts', function() {
    wp_enqueue_style(
        'astra-parent-style',
        get_template_directory_uri() . '/style.css'
    );
} );

// 排盤頁面專用資源（只在使用「七政四餘排盤」模板時載入）
add_action( 'wp_enqueue_scripts', function() {
    if ( ! is_page_template( 'page-panlou.php' ) ) return;

    wp_enqueue_style(
        'panlou-style',
        get_stylesheet_directory_uri() . '/assets/css/panlou.css',
        [],
        '2.6.0'
    );

    wp_enqueue_script(
        'astronomy-engine',
        get_stylesheet_directory_uri() . '/assets/js/astronomy.browser.min.js',
        [],
        '2.1.19',
        true
    );

    wp_enqueue_script(
        'panlou-script',
        get_stylesheet_directory_uri() . '/assets/js/panlou.js',
        [ 'astronomy-engine' ],
        '2.4.0',
        true
    );
} );

// 排盤頁面使用全寬佈局（無側欄）
add_filter( 'astra_page_layout', function( $layout ) {
    if ( is_page_template( 'page-panlou.php' ) ) {
        return 'no-sidebar';
    }
    return $layout;
} );
