<?php
/**
 * Tour Operator 2.x Google maps for sites migrated from Tour Operator 1.x.
 *
 * Live ATI (TO 1.x) shows a Google cluster map on destinations, tours and
 * accommodation. On TO 2.2 the same map, fed the migrated data, fails two ways:
 *
 * 1. Markers without coordinates. Maps::map_output() skips a connection only
 *    when its `location['longitude']` is set and empty, so a location with no
 *    2.x keys renders a marker with empty coordinates, which maps.js places at
 *    0,0 and fits into the bounds. Live (1.x) leaves those regions off the map.
 * 2. Wrong zoom. lsx_to_map() reads the zoom from the cached map data, which
 *    does not carry it, so every map falls back to 15. Live uses the post's own
 *    `location['zoom']` (Zimbabwe: 4).
 *
 * The coordinates themselves are a data problem (1.x stored `lat`/`long`, 2.x
 * reads `latitude`/`longitude`), fixed once by ATI_TO_Maps_Location_Migration.
 *
 * Everything here goes through Tour Operator's own hooks; nothing is patched.
 * Written to be portable to other TO 1.x → 2.x rebuilds (e.g. Southern
 * Destinations).
 *
 * @package ATI_Theme_2026
 */

/**
 * Makes Tour Operator 2.x Google maps behave as they did on 1.x.
 */
class ATI_TO_Google_Maps {

	/**
	 * Register the hooks.
	 */
	public function register() {
		add_filter( 'render_block', array( $this, 'remove_empty_map_section' ), 12, 2 );
		add_filter( 'lsx_to_maps_args', array( $this, 'filter_map_args' ), 20, 2 );
	}

	/**
	 * Remove a map section that has nothing to show.
	 *
	 * Tour Operator only hides `.lsx-location-wrapper` when lsx_to_has_map() is
	 * false, and that is true for any destination with regions or accommodation,
	 * placeable or not. A post with no map assigned would then show the heading
	 * and a "Click here to display the map" plate that opens an empty map. The
	 * section (heading and sticky-menu entry included, since the sticky menu is
	 * built from the sections on the page) is removed when the rendered map has
	 * no marker with coordinates, no position of its own and no KML route.
	 *
	 * @param string $block_content Rendered block content.
	 * @param array  $block         Parsed block data.
	 * @return string
	 */
	public function remove_empty_map_section( $block_content, $block ) {
		if ( 'core/group' !== ( $block['blockName'] ?? '' ) || ! is_string( $block_content ) ) {
			return $block_content;
		}

		$class = $block['attrs']['className'] ?? '';
		if ( ! preg_match( '/(^|\s)lsx-location-wrapper(\s|$)/', $class ) ) {
			return $block_content;
		}

		// A WETU map, or any other map type, is not ours to judge.
		if ( false === strpos( $block_content, 'lsx-map-preview' ) ) {
			return $block_content;
		}

		return $this->map_has_content( $block_content ) ? $block_content : '';
	}

	/**
	 * Whether rendered Google map markup has anything Tour Operator can place.
	 *
	 * @param string $html Rendered map section.
	 * @return bool
	 */
	public function map_has_content( $html ) {
		if ( ! preg_match( '/<div[^>]*class="[^"]*\blsx-map-details\b[^"]*"[^>]*>/', $html, $details ) ) {
			return false;
		}

		if ( preg_match( '/\bdata-kml="[^"]+"/', $details[0] ) ) {
			return true;
		}

		if ( preg_match_all( '/<div class="map-data"[^>]*>/', $html, $markers ) ) {
			foreach ( $markers[0] as $marker ) {
				if ( $this->attr_is_coordinate( $marker, 'data-lat' ) && $this->attr_is_coordinate( $marker, 'data-long' ) ) {
					return true;
				}
			}
		}

		// No markers: a single map of the post itself, if it has a position.
		return $this->attr_is_coordinate( $details[0], 'data-lat' )
			&& $this->attr_is_coordinate( $details[0], 'data-long' )
			&& false === strpos( $details[0], 'data-lat="' . self::TO_DEFAULT_LAT . '"' );
	}

	/**
	 * Tour Operator's fallback latitude when a map has no position (Cape Town).
	 */
	const TO_DEFAULT_LAT = '-33.914482';

	/**
	 * Whether an attribute in a tag holds a numeric coordinate.
	 *
	 * @param string $tag  Opening tag.
	 * @param string $name Attribute name.
	 * @return bool
	 */
	private function attr_is_coordinate( $tag, $name ) {
		return (bool) preg_match( '/\b' . preg_quote( $name, '/' ) . '="(-?\d+(\.\d+)?)"/', $tag );
	}

	/**
	 * Leave out markers that have no coordinates, and use the post's own zoom.
	 *
	 * @param mixed $args    Map arguments for Maps::map_output().
	 * @param int   $post_id The post the map belongs to.
	 * @return mixed
	 */
	public function filter_map_args( $args, $post_id = 0 ) {
		if ( ! is_array( $args ) ) {
			return $args;
		}

		$args = $this->restore_cached_args( $args, $post_id );

		if ( ! empty( $args['connections'] ) ) {
			$connections = array_values( array_filter( (array) $args['connections'], array( $this, 'has_coordinates' ) ) );

			if ( $connections ) {
				$args['connections'] = $connections;
			} elseif ( $post_id && $this->has_coordinates( $post_id ) ) {
				// Nothing connected can be placed: show the post itself instead.
				$location = get_post_meta( $post_id, 'location', true );

				unset( $args['connections'] );
				$args['type']      = 'single';
				$args['latitude']  = $location['latitude'];
				$args['longitude'] = $location['longitude'];
			}
		}

		if ( empty( $args['disable_auto_zoom'] ) && $post_id ) {
			$location = get_post_meta( $post_id, 'location', true );

			if ( is_array( $location ) && ! empty( $location['zoom'] ) && is_numeric( $location['zoom'] ) ) {
				$args['zoom'] = (int) $location['zoom'];
			}
		}

		return $args;
	}

	/**
	 * Fill the map arguments lsx_to_map() lost from Tour Operator's own cache.
	 *
	 * Tour Operator's lsx_to_has_map() caches `array( 'location' => …, 'args' => … )` in the
	 * `{post_id}_location` transient, but lsx_to_map() reads `latitude`,
	 * `longitude` and `connections` from the top level of that array, where they
	 * never are. Accommodation maps lose their position and tour route maps their
	 * itinerary stops. The cached `args` are complete (lsx_to_has_map() built them
	 * through this same filter), so anything missing is taken from there.
	 *
	 * @param array $args    Map arguments.
	 * @param int   $post_id The post the map belongs to.
	 * @return array
	 */
	private function restore_cached_args( array $args, $post_id ) {
		$cached = $post_id ? get_transient( $post_id . '_location' ) : false;

		if ( ! is_array( $cached ) || empty( $cached['args'] ) || ! is_array( $cached['args'] ) ) {
			return $args;
		}

		foreach ( array( 'type', 'connections', 'latitude', 'longitude', 'kml' ) as $key ) {
			if ( empty( $args[ $key ] ) && ! empty( $cached['args'][ $key ] ) ) {
				$args[ $key ] = $cached['args'][ $key ];
			}
		}

		return $args;
	}

	/**
	 * Whether Tour Operator can place a post on the map.
	 *
	 * Checks the 2.x keys only, because those are what Maps::map_output() reads.
	 *
	 * @param int|string $post_id Post ID.
	 * @return bool
	 */
	public function has_coordinates( $post_id ) {
		$location = get_post_meta( (int) $post_id, 'location', true );

		return is_array( $location )
			&& isset( $location['latitude'], $location['longitude'] )
			&& is_numeric( $location['latitude'] )
			&& is_numeric( $location['longitude'] );
	}
}
