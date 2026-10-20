<?php
/**
 * Tour Operator 2.x Google maps for sites migrated from Tour Operator 1.x.
 *
 * Live ATI (TO 1.x) shows a Google cluster map on destinations, tours and
 * accommodation. On TO 2.2 the same map, fed the migrated data, fails three ways:
 *
 * 1. "Click here to display the map" only jumps to the top of the page. TO's
 *    lsx/map binding (Bindings::render_map_block(), render_block priority 10)
 *    emits lsx_to_map()'s bare `.lsx-map-details`, but maps.js only binds the
 *    plate when that markup sits inside a `.lsx-map` container.
 * 2. Markers without coordinates. Maps::map_output() skips a connection only
 *    when its `location['longitude']` is set and empty, so a location with no
 *    2.x keys renders a marker with empty coordinates, which maps.js places at
 *    0,0 and fits into the bounds. Live (1.x) leaves those regions off the map.
 * 3. Wrong zoom. lsx_to_map() reads the zoom from the cached map data, which
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
		add_filter( 'render_block', array( $this, 'wrap_map_details' ), 11, 2 );
		add_filter( 'lsx_to_maps_args', array( $this, 'filter_map_args' ), 20, 2 );
	}

	/**
	 * Wrap the lsx/map binding's output in the `.lsx-map` container maps.js reads.
	 *
	 * @param string $block_content Rendered block content.
	 * @param array  $block         Parsed block data.
	 * @return string
	 */
	public function wrap_map_details( $block_content, $block ) {
		$binding = $block['attrs']['metadata']['bindings']['content'] ?? array();

		if ( 'lsx/map' !== ( $binding['source'] ?? '' ) || ! is_string( $block_content ) ) {
			return $block_content;
		}

		if ( false === strpos( $block_content, 'lsx-map-details' ) || preg_match( '/class="[^"]*\blsx-map\b[^-]/', $block_content ) ) {
			return $block_content;
		}

		return '<div class="lsx-map">' . $block_content . '</div>';
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
