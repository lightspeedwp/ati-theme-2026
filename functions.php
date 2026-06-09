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
 * SVG markup for a filled rating star (Phosphor Star Weight Fill).
 */
define(
	'ATI_STAR_FULL_SVG',
	'<svg class="ati-star ati-star--full" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 256 256" aria-hidden="true" focusable="false">' .
	'<path d="M234.29,114.85l-45,38.83L203,211.75a16.4,16.4,0,0,1-24.5,17.82L128,198.49,77.47,229.57A16.4,16.4,0,0,1,53,211.75l13.76-58.07-45-38.83A16.46,16.46,0,0,1,31.08,86l59-4.76,22.76-55.08a16.36,16.36,0,0,1,30.27,0l22.75,55.08,59,4.76a16.46,16.46,0,0,1,9.37,28.86Z"></path>' .
	'</svg>'
);

/**
 * SVG markup for an empty/outline rating star (Phosphor Star Weight Regular).
 */
define(
	'ATI_STAR_EMPTY_SVG',
	'<svg class="ati-star ati-star--empty" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 256 256" aria-hidden="true" focusable="false">' .
	'<path d="M239.18,97.26A16.38,16.38,0,0,0,224.92,86l-59-4.76L143.14,26.15a16.36,16.36,0,0,0-30.27,0L90.11,81.23,31.08,86a16.46,16.46,0,0,0-9.37,28.86l45,38.83L53,211.75a16.38,16.38,0,0,0,24.5,17.82L128,198.49l50.53,31.08A16.4,16.4,0,0,0,203,211.75l-13.76-58.07,45-38.83A16.43,16.43,0,0,0,239.18,97.26Zm-15.34,5.47-48.7,42a8,8,0,0,0-2.56,7.91l14.88,62.8a.37.37,0,0,1-.17.48c-.18.14-.23.11-.38,0l-54.72-33.65a8,8,0,0,0-8.38,0L69.09,215.94c-.15.09-.19.12-.38,0a.37.37,0,0,1-.17-.48l14.88-62.8a8,8,0,0,0-2.56-7.91l-48.7-42c-.12-.1-.23-.19-.13-.5s.18-.27.33-.29l63.92-5.16A8,8,0,0,0,103,91.86l24.62-59.61c.08-.17.11-.25.35-.25s.27.08.35.25L153,91.86a8,8,0,0,0,6.75,4.92l63.92,5.16c.15,0,.24,0,.33.29S224,102.63,223.84,102.73Z"></path>' .
	'</svg>'
);

/**
 * Build star SVG markup from a full and empty count.
 *
 * @param int $full_count  Number of filled stars.
 * @param int $empty_count Number of empty stars.
 * @return string
 */
function ati_theme_2026_build_star_markup( $full_count, $empty_count ) {
	$label  = sprintf(
		/* translators: %1$d filled, %2$d total */
		_n( '%1$d star out of %2$d', '%1$d stars out of %2$d', $full_count, 'ati-theme-2026' ),
		$full_count,
		$full_count + $empty_count
	);
	$stars  = str_repeat( ATI_STAR_FULL_SVG, $full_count );
	$stars .= str_repeat( ATI_STAR_EMPTY_SVG, $empty_count );
	return '<span class="ati-rating-stars" role="img" aria-label="' . esc_attr( $label ) . '">' . $stars . '</span>';
}

/**
 * Replace plugin star images with SVGs in lsx_to_custom_field_query output.
 * Runs at priority 15, after accommodation (5) and tour (10) rating filters.
 *
 * @param string $html     Filtered HTML.
 * @param string $meta_key Meta key being queried.
 * @param mixed  $value    Raw meta value.
 * @param string $before   HTML before the output.
 * @param string $after    HTML after the output.
 * @return string
 */
function ati_theme_2026_filter_rating_stars( $html, $meta_key, $value, $before, $after ) {
	if ( 'rating' !== $meta_key || empty( $html ) ) {
		return $html;
	}

	$full_count  = preg_match_all( '/rating-star-full\.png/i', $html );
	$empty_count = preg_match_all( '/rating-star-empty\.png/i', $html );

	// Fall back to Font Awesome classes used by the tour post type.
	if ( 0 === $full_count + $empty_count ) {
		$full_count  = preg_match_all( '/\bfa-star\b(?!-o)/i', $html );
		$empty_count = preg_match_all( '/\bfa-star-o\b/i', $html );
	}

	if ( 0 === $full_count + $empty_count ) {
		return $html;
	}

	return $before . ati_theme_2026_build_star_markup( $full_count, $empty_count ) . $after;
}
add_filter( 'lsx_to_custom_field_query', 'ati_theme_2026_filter_rating_stars', 15, 5 );

/**
 * Render bound rating paragraphs as SVG stars via the render_block hook.
 *
 * WordPress's block-binding API sanitises the value returned by
 * lsx_to_custom_field_query with wp_kses_post(), which strips SVG children
 * from any <span> our lsx filter produces. This hook runs on the fully
 * rendered HTML and re-injects the SVG content, using post meta as the
 * authoritative star count to avoid any dependency on the sanitised markup.
 *
 * @param string $block_content Rendered block content.
 * @param array  $block         Parsed block data.
 * @return string
 */
function ati_theme_2026_render_rating_stars( $block_content, $block ) {
if ( empty( $block_content ) || empty( $block['blockName'] ) || 'core/paragraph' !== $block['blockName'] ) {
return $block_content;
}

$binding = $block['attrs']['metadata']['bindings']['content'] ?? array();
if ( empty( $binding['source'] ) || 'lsx/post-meta' !== $binding['source'] || empty( $binding['args']['key'] ) || 'rating' !== $binding['args']['key'] ) {
return $block_content;
}

// Prefer an authoritative count from post meta so we are not dependent on
// whatever survived wp_kses_post() sanitisation in the bound HTML.
$post_id = get_the_ID();
if ( $post_id ) {
	$raw_rating = (int) get_post_meta( $post_id, 'rating', true );
	if ( $raw_rating > 0 ) {
		$full_count  = min( $raw_rating, 5 );
		$empty_count = max( 0, 5 - $full_count );
	}
}

// Fallback: count star images still present in the HTML (non-binding contexts).
if ( ! isset( $full_count ) ) {
	$full_count  = preg_match_all( '/rating-star-full\.png/i', $block_content );
	$empty_count = preg_match_all( '/rating-star-empty\.png/i', $block_content );

	if ( 0 === $full_count + $empty_count ) {
		$full_count  = preg_match_all( '/\bfa-star\b(?!-o)/i', $block_content );
		$empty_count = preg_match_all( '/\bfa-star-o\b/i', $block_content );
	}

	if ( 0 === $full_count + $empty_count ) {
		return $block_content;
	}
}

$stars_markup = ati_theme_2026_build_star_markup( $full_count, $empty_count );

// Replace an existing (possibly empty) .ati-rating-stars span – left by the
// lsx_to_custom_field_query filter after wp_kses_post() stripped its SVG children.
if ( false !== strpos( $block_content, 'ati-rating-stars' ) ) {
	return preg_replace(
		'/<span[^>]+class="[^"]*ati-rating-stars[^"]*"[^>]*>.*?<\/span>/si',
		$stars_markup,
		$block_content,
		1
	);
}

// Fallback: replace figure/img star elements, preserving any prefix text.
if ( false !== strpos( $block_content, 'rating-star' ) ) {
	return preg_replace(
		'/(?:<figure[^>]*>.*?rating-star-(?:full|empty)\.png[^>]*\/?>(?:.*?<\/figure>)?\s*)+/si',
		$stars_markup,
		$block_content,
		1
	);
}

// Fallback: replace Font Awesome star icons (tour post type).
if ( false !== strpos( $block_content, 'fa-star' ) ) {
	return preg_replace(
		'/(?:<i[^>]+class="[^"]*fa[^"]*fa-star[^"]*"[^>]*>.*?<\/i>\s*)+/si',
		$stars_markup,
		$block_content,
		1
	);
}

return $block_content;
}
add_filter( 'render_block', 'ati_theme_2026_render_rating_stars', 35, 2 );

/**
 * Prevent the Tour Operator plugin from seeding its own modal-accommodation
 * template part into the database. Without this, the plugin re-creates the
 * post from its own plugin file on every init after a Site Editor reset,
 * overriding the theme's parts/modal-accommodation.html.
 */
add_filter(
	'lsx_to_template_parts',
	function ( $template_parts ) {
		unset( $template_parts['modal-accommodation'] );
		return $template_parts;
	}
);

/**
 * Restore the viewBox attribute on icon-block SVGs inside modals.
 *
 * The Tour Operator plugin outputs modal HTML through wp_kses() with a custom
 * allowed-HTML array that lists 'viewBox' with camelCase. wp_kses lowercases
 * every attribute name before checking the allowlist, so 'viewBox' never
 * matches and the attribute is stripped. Without viewBox="0 0 256 256" the
 * Phosphor icon paths (coordinate space 0–256) are drawn outside the 32 × 32
 * SVG canvas and are completely invisible.
 *
 * Because modals require JavaScript to function, a footer inline script is the
 * cleanest theme-side workaround without patching the plugin.
 */
add_action(
	'wp_footer',
	function () {
		?>
		<script>
		(function () {
			document.querySelectorAll(
				'.wp-block-hm-popup .wp-block-outermost-icon-block svg:not([viewBox])'
			).forEach( function ( svg ) {
				svg.setAttribute( 'viewBox', '0 0 256 256' );
			} );
		})();
		</script>
		<?php
	},
	15
);

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