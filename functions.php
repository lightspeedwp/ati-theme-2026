<?php
/**
 * Functions for the ATI Theme 2026 standalone block theme.
 *
 * @package ATI_Theme_2026
 */

if ( ! defined( 'ABSPATH' ) ) {
exit;
}

/**
 * Set up theme defaults and editor support.
 */
function ati_theme_2026_setup() {
load_theme_textdomain( 'ati-theme-2026', get_template_directory() . '/languages' );
add_editor_style( 'style.css' );
remove_theme_support( 'core-block-patterns' );
}
add_action( 'after_setup_theme', 'ati_theme_2026_setup' );

/**
 * Enqueue front-end assets.
 */
function ati_theme_2026_enqueue_scripts() {
$theme = wp_get_theme();

wp_enqueue_style(
'ati-theme-2026',
get_stylesheet_uri(),
array(),
$theme->get( 'Version' )
);

$faq_script = get_theme_file_path( 'assets/js/faq-accordion.js' );
$responsive_image_map_script = get_theme_file_path( 'assets/js/responsive-image-maps.js' );

if ( file_exists( $faq_script ) ) {
wp_enqueue_script(
'ati-theme-2026-faq-accordion',
get_theme_file_uri( 'assets/js/faq-accordion.js' ),
array(),
$theme->get( 'Version' ),
array(
'strategy'  => 'defer',
'in_footer' => true,
)
);
}

if ( file_exists( $responsive_image_map_script ) ) {
wp_enqueue_script(
'ati-theme-2026-responsive-image-maps',
get_theme_file_uri( 'assets/js/responsive-image-maps.js' ),
array(),
$theme->get( 'Version' ),
array(
'strategy'  => 'defer',
'in_footer' => true,
)
);
}
}
add_action( 'wp_enqueue_scripts', 'ati_theme_2026_enqueue_scripts' );

/**
 * Split multi-link ATI button paragraph bindings into individual button items.
 *
 * @param string $block_content Rendered block content.
 * @param array  $block         Parsed block data.
 * @return string
 */
function ati_theme_2026_render_button_links( $block_content, $block ) {
if ( empty( $block_content ) || empty( $block['blockName'] ) || 'core/paragraph' !== $block['blockName'] ) {
return $block_content;
}

$binding = $block['attrs']['metadata']['bindings']['content'] ?? array();
if ( empty( $binding['source'] ) || 'lsx/post-connection' !== $binding['source'] ) {
return $block_content;
}

if ( false === strpos( $block_content, 'is-style-ati-button' ) ) {
return $block_content;
}

preg_match_all( '/<a\b[^>]*>.*?<\/a>/si', $block_content, $matches );
if ( empty( $matches[0] ) || count( $matches[0] ) < 2 ) {
return $block_content;
}

$links_html = implode( '', array_map( 'trim', $matches[0] ) );

$block_content = preg_replace_callback(
'/<p\b([^>]*)class="([^"]*)"([^>]*)>/i',
static function ( $matches ) {
$classes = preg_split( '/\s+/', trim( $matches[2] ) );
if ( ! in_array( 'ati-button-links', $classes, true ) ) {
$classes[] = 'ati-button-links';
}

return '<p' . $matches[1] . 'class="' . esc_attr( implode( ' ', array_filter( $classes ) ) ) . '"' . $matches[3] . '>';
},
$block_content,
1
);

$block_content = preg_replace_callback(
'/(<p\b[^>]*>)(.*?)(<\/p>)/si',
static function ( $matches ) use ( $links_html ) {
return $matches[1] . $links_html . $matches[3];
},
$block_content,
1
);

return $block_content;
}
add_filter( 'render_block', 'ati_theme_2026_render_button_links', 30, 2 );

/**
 * Render bound accommodation rating paragraphs as ATI star pills.
 *
 * @param string $block_content Rendered block content.
 * @param array  $block         Parsed block data.
 * @return string
 */
function ati_theme_2026_render_rating_stars( $block_content, $block ) {
if ( empty( $block_content ) || empty( $block['blockName'] ) || 'core/paragraph' !== $block['blockName'] ) {
return $block_content;
}

if ( false === strpos( $block_content, 'is-style-ati-star-block' ) ) {
return $block_content;
}

$binding = $block['attrs']['metadata']['bindings']['content'] ?? array();
if ( empty( $binding['source'] ) || 'lsx/post-meta' !== $binding['source'] || empty( $binding['args']['key'] ) || 'rating' !== $binding['args']['key'] ) {
return $block_content;
}

$full_stars  = preg_match_all( '/rating-star-full\.png|fa\s+fa-star(?!-o)/i', $block_content );
$empty_stars = preg_match_all( '/rating-star-empty\.png|fa\s+fa-star-o/i', $block_content );
$total_stars = $full_stars + $empty_stars;

if ( 0 === $total_stars ) {
return $block_content;
}

$stars_markup = '';

for ( $index = 0; $index < $full_stars; $index++ ) {
$stars_markup .= '<span class="ati-rating-star" aria-hidden="true">&#9733;</span>';
}

for ( $index = 0; $index < $empty_stars; $index++ ) {
$stars_markup .= '<span class="ati-rating-star is-empty" aria-hidden="true">&#9733;</span>';
}

$block_content = preg_replace_callback(
'/<p\b([^>]*)class="([^"]*)"([^>]*)>/i',
static function ( $matches ) {
$classes = preg_split( '/\s+/', trim( $matches[2] ) );
if ( ! in_array( 'ati-rating-stars', $classes, true ) ) {
$classes[] = 'ati-rating-stars';
}

return '<p' . $matches[1] . 'class="' . esc_attr( implode( ' ', array_filter( $classes ) ) ) . '"' . $matches[3] . '>';
},
$block_content,
1
);

$block_content = preg_replace(
'/(<p\b[^>]*>)(.*?)(<\/p>)/si',
'$1' . $stars_markup . '$3',
$block_content,
1
);

return $block_content;
}
add_filter( 'render_block', 'ati_theme_2026_render_rating_stars', 35, 2 );

/**
 * Register custom theme blocks from their block.json manifests.
 *
 * Each subdirectory under /blocks/ contains a block.json (which declares the
 * block to the editor, its supports, and its render file) so no inline
 * render_callback is needed here.
 */
function ati_theme_2026_register_blocks() {
	register_block_type( get_template_directory() . '/blocks/team-contact-card' );
}
add_action( 'init', 'ati_theme_2026_register_blocks' );

/**
 * Process list meta fields (included/not_included) to ensure consistent list output.
 *
 * Converts newline-separated text into HTML lists while preserving existing list
 * markup. Adds appropriate icons for included/excluded items.
 *
 * @param string $return_html  The formatted HTML output.
 * @param string $meta_key  The meta key being queried.
 * @param mixed  $value  The raw meta value.
 * @param string $before  HTML before content.
 * @param string $after  HTML after content.
 *
 * @return string Processed HTML with list formatting and icons.
 */
add_filter(
    'lsx_to_custom_field_query',
    function ($return_html, $meta_key, $value, $before, $after) {
        // Only process included and not_included fields
        if (!in_array($meta_key, array('included', 'not_included'), true)) {
            return $return_html;
        }

        if (empty($value)) {
            return $return_html;
        }

        // Strip out paragraph tags that WYSIWYG editors often add
        $processed_value = preg_replace('/<p[^>]*>|<\/p>/i', '', $value);

        // If already contains list markup, keep as-is for now
        if (preg_match('/<[ou]l[^>]*>/i', $processed_value)) {
            return $before . $processed_value . $after;
        }

        // Split by line breaks (handles different line ending types)
        $lines = preg_split('/\r\n|\r|\n/', $processed_value);

        // Filter out empty lines
        $lines = array_filter(array_map('trim', $lines));

        if (empty($lines)) {
            return $return_html;
        }

        // Build unordered list without icons (icons added via render_block filter)
        $output = '<ul class="lsx-' . esc_attr($meta_key) . '-list">';
        foreach ($lines as $line) {
            $output .= '<li>' . wp_kses_post($line) . '</li>';
        }
        $output .= '</ul>';

        return $before . $output . $after;
    },
    10,
    5
);

/**
 * Add icons to included/not_included lists via render_block filter.
 *
 * This filter runs after block bindings have been processed, allowing us to
 * inject SVG icons into the final rendered HTML.
 *
 * @param string $block_content  The block content.
 * @param array  $block  The block data.
 *
 * @return string Modified block content with icons.
 */
add_filter(
    'render_block',
    function ($block_content, $block) {
        // Only process paragraph blocks with LSX post-meta bindings
        if ('core/paragraph' !== $block['blockName']) {
            return $block_content;
        }

        // Check if this has our list classes
        $has_included = strpos($block_content, 'lsx-included-list') !== false;
        $has_excluded = strpos($block_content, 'lsx-not_included-list') !== false;

        if (!$has_included && !$has_excluded) {
            return $block_content;
        }

        // Define icons
        $check_icon = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" '
            . 'xmlns="http://www.w3.org/2000/svg" aria-hidden="true">'
            . '<path d="M9 12.75L11.25 15L15 9.75M21 12C21 16.9706 16.9706 21 12 21'
            . 'C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 '
            . '7.02944 21 12Z" stroke="currentColor" stroke-width="1.5" '
            . 'stroke-linecap="round" stroke-linejoin="round"/></svg>';

        $cross_icon = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" '
            . 'xmlns="http://www.w3.org/2000/svg" aria-hidden="true">'
            . '<path d="M9.75 9.75L14.25 14.25M14.25 9.75L9.75 14.25M21 12C21 '
            . '16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 '
            . '7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" '
            . 'stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>'
            . '</svg>';

        // Inject check icon into included list items
        if ($has_included) {
            $block_content = preg_replace_callback(
                '/<ul[^>]*class="[^"]*lsx-included-list[^"]*"[^>]*>(.*?)<\/ul>/si',
                function ($matches) use ($check_icon) {
                    $ul_content = $matches[1];
                    // Add check icon to each <li> in this ul
                    $ul_content = preg_replace('/(<li>)/i', '$1' . $check_icon, $ul_content);
                    // Rebuild the ul
                    // Find the opening <ul ...> tag
                    preg_match('/^<ul[^>]*class="[^"]*lsx-included-list[^"]*"[^>]*>/i', $matches[0], $ul_open);
                    $ul_tag = $ul_open[0];
                    return $ul_tag . $ul_content . '</ul>';
                },
                $block_content
            );
        }

        // Inject cross icon into not_included list items
        if ($has_excluded) {
            $block_content = preg_replace_callback(
                '/<ul[^>]*class="[^"]*lsx-not_included-list[^"]*"[^>]*>(.*?)<\/ul>/si',
                function ($matches) use ($cross_icon) {
                    $ul_content = $matches[1];
                    // Add cross icon to each <li> in this ul
                    $ul_content = preg_replace('/(<li>)/i', '$1' . $cross_icon, $ul_content);
                    // Rebuild the ul
                    // Find the opening <ul ...> tag
                    preg_match('/^<ul[^>]*class="[^"]*lsx-not_included-list[^"]*"[^>]*>/i', $matches[0], $ul_open);
                    $ul_tag = $ul_open[0];
                    return $ul_tag . $ul_content . '</ul>';
                },
                $block_content
            );
        }

        return $block_content;
    },
    10,
    2
);