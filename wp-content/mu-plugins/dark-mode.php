<?php
/**
 * Plugin Name: 深色模式樣式
 * Description: 自動載入深色配色 CSS
 */
add_action('wp_head', function() { ?>
<style id="dark-mode-css">
body, .site { background-color: #0f0f0f !important; color: #e0e0e0 !important; }
.main-header-bar, .ast-primary-header-bar { background-color: #1a1a1a !important; border-bottom: 1px solid #2a2a2a !important; }
.main-header-menu a { color: #e0e0e0 !important; }
.main-header-menu a:hover, .main-header-menu .current-menu-item > a { color: #c9a96e !important; }
.site-title a, .ast-site-title-wrap a { color: #ffffff !important; }
.ast-container, .site-content, .entry-content, #page { background-color: #0f0f0f !important; }
h1, h2, h3, h4, h5, h6, .entry-title, .entry-title a { color: #f5f0e8 !important; }
p, li, td, th, .ast-blog-single-element { color: #c8c8c8 !important; }
a { color: #c9a96e !important; }
a:hover { color: #e8c98a !important; }
.wp-block-button__link, .wp-element-button { background-color: #c9a96e !important; color: #0f0f0f !important; border: none !important; }
.wp-block-button__link:hover, .wp-element-button:hover { background-color: #e8c98a !important; color: #0f0f0f !important; }
hr, .wp-block-separator { border-color: #2a2a2a !important; }
.site-footer, .ast-small-footer { background-color: #111111 !important; color: #888 !important; border-top: 1px solid #2a2a2a !important; }
.wp-block-column { background-color: #1a1a1a !important; padding: 1.5em !important; border-radius: 6px !important; border: 1px solid #2a2a2a !important; }
.ast-article-post, .ast-article-inner { background-color: #1a1a1a !important; }
.ast-pagination .page-numbers { color: #c9a96e !important; }
input, textarea, select { background-color: #1a1a1a !important; color: #e0e0e0 !important; border: 1px solid #333 !important; }
.custom-logo, .custom-logo-link img { width: auto !important; max-height: 90px !important; }
.ast-site-identity .custom-logo-link { display: flex; align-items: center; }
</style>
<?php });
