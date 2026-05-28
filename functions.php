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

