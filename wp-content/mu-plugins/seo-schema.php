<?php
/**
 * Plugin Name: SEO & AEO Schema
 * Description: JSON-LD structured data for SEO and Answer Engine Optimization
 */

add_action('wp_head', function() {
    $site_url = home_url();

    // ── 1. WebSite schema（全站）── //
    $website = [
        '@context' => 'https://schema.org',
        '@type'    => 'WebSite',
        '@id'      => $site_url . '/#website',
        'url'      => $site_url,
        'name'     => '共星閣 | 七政四餘命理',
        'description' => '七政四餘命理師裕博，提供傳統中式占星命盤諮詢與系統課程教學',
        'inLanguage'  => 'zh-TW',
        'potentialAction' => [
            '@type'       => 'SearchAction',
            'target'      => $site_url . '/?s={search_term_string}',
            'query-input' => 'required name=search_term_string',
        ],
    ];

    // ── 2. Person schema（命理師身份）── //
    $person = [
        '@context'    => 'https://schema.org',
        '@type'       => ['Person', 'ProfessionalService'],
        '@id'         => $site_url . '/#person',
        'name'        => '裕博',
        'jobTitle'    => '七政四餘命理師',
        'description' => '執業七年，專精七政四餘傳統中式占星體系。入門自面相，深耕古典天文命學。',
        'url'         => $site_url,
        'sameAs'      => ['https://lin.ee/wLHc9SYM'],
        'knowsAbout'  => ['七政四餘', '傳統中式占星', '命盤解讀', '大運流年推演'],
        'hasOccupation' => [
            '@type' => 'Occupation',
            'name'  => '命理師',
            'occupationLocation' => [
                '@type' => 'Country',
                'name'  => '台灣',
            ],
        ],
    ];

    // ── 3. Service schema（算命服務）── //
    $service = [
        '@context'    => 'https://schema.org',
        '@type'       => 'Service',
        '@id'         => $site_url . '/#service-consultation',
        'name'        => '七政四餘命盤諮詢',
        'description' => '以七政四餘傳統命學解讀個人命盤，涵蓋個性特質、事業、感情、健康等人生面向。',
        'provider'    => ['@id' => $site_url . '/#person'],
        'serviceType' => '命理諮詢',
        'areaServed'  => '台灣',
        'availableChannel' => [
            '@type'       => 'ServiceChannel',
            'serviceUrl'  => 'https://lin.ee/wLHc9SYM',
            'serviceName' => 'LINE 預約',
        ],
    ];

    // ── 4. Course schema（課程）── //
    $courses = [
        '@context' => 'https://schema.org',
        '@type'    => 'ItemList',
        'name'     => '七政四餘系統課程',
        'itemListElement' => [
            [
                '@type'       => 'Course',
                'position'    => 1,
                'name'        => '七政四餘入門班',
                'description' => '適合完全沒有命理基礎的新手。學習七政四餘基本架構、天體意義、命盤結構。目標：看懂命盤。',
                'provider'    => ['@id' => $site_url . '/#person'],
                'courseMode'  => 'online',
                'inLanguage'  => 'zh-TW',
            ],
            [
                '@type'       => 'Course',
                'position'    => 2,
                'name'        => '七政四餘進階班',
                'description' => '適合已完成入門班者。學習星曜組合判斷、大運流年推演。目標：對命盤提出有根據的判斷。',
                'provider'    => ['@id' => $site_url . '/#person'],
                'courseMode'  => 'online',
                'inLanguage'  => 'zh-TW',
            ],
            [
                '@type'       => 'Course',
                'position'    => 3,
                'name'        => '七政四餘高階班',
                'description' => '適合已完成進階班者。複雜案例實戰、各類人生議題論斷。目標：獨立接案論命。',
                'provider'    => ['@id' => $site_url . '/#person'],
                'courseMode'  => 'online',
                'inLanguage'  => 'zh-TW',
            ],
        ],
    ];

    // ── 5. FAQPage schema（AEO 關鍵）── //
    $faq = [
        '@context'   => 'https://schema.org',
        '@type'      => 'FAQPage',
        'mainEntity' => [
            [
                '@type'          => 'Question',
                'name'           => '七政四餘是什麼？',
                'acceptedAnswer' => [
                    '@type' => 'Answer',
                    'text'  => '七政四餘是以古典天文為根基的傳統中式占星體系，以日、月、金、木、水、火、土七顆行星（七政）加上四餘（羅、計、孛、氣）來推演人生軌跡，是中國傳統命學中最接近西方占星的系統。',
                ],
            ],
            [
                '@type'          => 'Question',
                'name'           => '七政四餘和紫微斗數、八字有什麼不同？',
                'acceptedAnswer' => [
                    '@type' => 'Answer',
                    'text'  => '七政四餘直接使用真實天體位置，以天文計算為基礎，與西方占星同源，強調行星在黃道上的實際位置；八字以干支五行為主，紫微斗數則用假想星曜排盤，三者系統邏輯不同。',
                ],
            ],
            [
                '@type'          => 'Question',
                'name'           => '如何預約裕博老師的命盤諮詢？',
                'acceptedAnswer' => [
                    '@type' => 'Answer',
                    'text'  => '可透過 LINE 官方帳號聯繫預約，提供姓名與出生年月日時即可安排。LINE：https://lin.ee/wLHc9SYM',
                ],
            ],
            [
                '@type'          => 'Question',
                'name'           => '七政四餘課程適合完全沒有基礎的人嗎？',
                'acceptedAnswer' => [
                    '@type' => 'Answer',
                    'text'  => '適合。課程從入門班開始，針對完全沒有命理基礎的學員設計，循序進階，不跳關。',
                ],
            ],
        ],
    ];

    $schemas = [$website, $person, $service, $courses, $faq];
    foreach ($schemas as $schema) {
        echo '<script type="application/ld+json">' . wp_json_encode($schema, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT) . '</script>' . "\n";
    }
}, 1);

// ── Open Graph & Twitter Card meta tags ── //
add_action('wp_head', function() {
    $site_url   = home_url();
    $site_name  = '共星閣 | 七政四餘命理';
    $default_desc = '七政四餘命理師裕博，執業七年，提供傳統中式占星命盤諮詢與系統課程。';

    if (is_singular()) {
        $title = get_the_title() . ' | ' . $site_name;
        $desc  = wp_trim_words(get_the_excerpt() ?: get_the_content(), 30, '');
        $url   = get_permalink();
    } else {
        $title = $site_name;
        $desc  = $default_desc;
        $url   = $site_url;
    }

    $desc = $desc ?: $default_desc;
    ?>
<meta property="og:type"        content="website" />
<meta property="og:site_name"   content="<?php echo esc_attr($site_name); ?>" />
<meta property="og:title"       content="<?php echo esc_attr($title); ?>" />
<meta property="og:description" content="<?php echo esc_attr($desc); ?>" />
<meta property="og:url"         content="<?php echo esc_url($url); ?>" />
<meta property="og:locale"      content="zh_TW" />
<meta name="twitter:card"        content="summary" />
<meta name="twitter:title"       content="<?php echo esc_attr($title); ?>" />
<meta name="twitter:description" content="<?php echo esc_attr($desc); ?>" />
<meta name="description"         content="<?php echo esc_attr($desc); ?>" />
    <?php
}, 5);
