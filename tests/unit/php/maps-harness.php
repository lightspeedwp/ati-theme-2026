<?php
/**
 * Runs the Tour Operator map classes against fixtures, without WordPress.
 *
 * Prints one JSON object of named results for tests/unit/theme/maps.test.js.
 *
 *     php tests/unit/php/maps-harness.php
 *
 * @package ATI_Theme_2026
 * @subpackage Tests
 */

// Minimal WordPress stand-ins.
function add_filter() {}

$GLOBALS['ati_test_meta'] = array();

function get_post_meta( $post_id, $key = '', $single = false ) {
	return $GLOBALS['ati_test_meta'][ (int) $post_id ][ $key ] ?? '';
}

$GLOBALS['ati_test_transients'] = array();

function get_transient( $name ) {
	return $GLOBALS['ati_test_transients'][ $name ] ?? false;
}

$theme = dirname( __DIR__, 3 );
require $theme . '/inc/class-ati-to-google-maps.php';
require $theme . '/inc/class-ati-to-maps-location-migration.php';

$maps      = new ATI_TO_Google_Maps();
$migration = new ATI_TO_Maps_Location_Migration();

/**
 * A rendered map section, as Tour Operator and the theme produce it.
 *
 * @param string $details Opening tag attributes of `.lsx-map-details`, or null for none.
 * @param array  $markers Each marker as [lat, long].
 * @param bool   $preview Whether the click-to-load plate is present.
 * @return string
 */
function ati_test_section( $details, array $markers = array(), $preview = true ) {
	$html = '<section class="wp-block-group alignfull lsx-location-wrapper lsx-to-sticky-menu-section" id="map" data-sticky-menu-section="true">';
	if ( $preview ) {
		$html .= '<div class="wp-block-cover is-light lsx-map-preview"><p><a href="#">Click here to display the map</a></p></div>';
	}
	if ( null !== $details ) {
		$html .= '<div class="lsx-map"><div class="lsx-map-details" data-zoom="4" data-type="cluster" ' . $details . '><div class="lsx-map-markers" style="display:none;">';
		foreach ( $markers as $marker ) {
			$html .= '<div class="map-data" data-icon="x.svg" data-id="1" data-long="' . $marker[1] . '" data-lat="' . $marker[0] . '" data-link="/x/" data-title="X"></div>';
		}
		$html .= '</div></div></div>';
	}
	return $html . '</section>';
}

$wrapper = array(
	'blockName' => 'core/group',
	'attrs'     => array( 'className' => 'lsx-location-wrapper' ),
);
$default = 'data-lat="-33.914482" data-long="18.3758789"';

$section = static function ( $html, $block = null ) use ( $maps, $wrapper ) {
	return '' === $maps->remove_empty_map_section( $html, $block ?? $wrapper ) ? 'removed' : 'kept';
};

$results = array(
	// The section stays when the map can show something.
	'section_markers_with_coordinates'  => $section( ati_test_section( $default, array( array( '-17.93', '25.82' ), array( '', '' ) ) ) ),
	'section_own_position_no_markers'   => $section( ati_test_section( 'data-lat="-19.015438" data-long="29.154857"' ) ),
	'section_kml_route'                 => $section( ati_test_section( $default . ' data-kml="https://example.com/route.kml"' ) ),
	// The section goes when there is no map to show.
	'section_markers_all_empty'         => $section( ati_test_section( $default, array( array( '', '' ), array( '', '' ) ) ) ),
	'section_default_position_only'     => $section( ati_test_section( $default ) ),
	'section_empty_position'            => $section( ati_test_section( 'data-lat="" data-long=""' ) ),
	'section_plate_without_map_data'    => $section( ati_test_section( null ) ),
	// Not a Google map section: left alone.
	'section_wetu_map'                  => $section( '<section class="wp-block-group lsx-location-wrapper"><iframe class="wetu-map" src="https://wetu.com/EmbedMap/?ids=1"></iframe></section>' ),
	'section_other_group'               => $section( ati_test_section( null ), array( 'blockName' => 'core/group', 'attrs' => array( 'className' => 'something-else' ) ) ),
	'section_other_block'               => $section( ati_test_section( null ), array( 'blockName' => 'core/paragraph', 'attrs' => array( 'className' => 'lsx-location-wrapper' ) ) ),
);

// Map arguments: markers without coordinates, fallback, zoom.
$GLOBALS['ati_test_meta'] = array(
	10 => array( 'location' => array( 'lat' => '-19.0', 'long' => '29.1', 'latitude' => '-19.0', 'longitude' => '29.1', 'zoom' => '4' ) ),
	11 => array( 'location' => array( 'latitude' => '', 'longitude' => '' ) ),
	12 => array( 'location' => array( 'latitude' => '-17.93', 'longitude' => '25.82' ) ),
	13 => array( 'location' => array( 'lat' => '-20.1', 'long' => '28.5' ) ),
);

$results['args_drops_unplaceable']    = $maps->filter_map_args( array( 'type' => 'cluster', 'connections' => array( '11', '12', '13' ), 'zoom' => 15 ), 10 );
$results['args_falls_back_to_post']   = $maps->filter_map_args( array( 'type' => 'cluster', 'connections' => array( '11' ), 'zoom' => 15 ), 10 );
$results['args_manual_zoom_kept']     = $maps->filter_map_args( array( 'type' => 'cluster', 'connections' => array( '12' ), 'zoom' => 9, 'disable_auto_zoom' => true ), 10 );
$results['args_nothing_placeable']    = $maps->filter_map_args( array( 'type' => 'cluster', 'connections' => array( '11' ), 'zoom' => 15 ), 11 );

// lsx_to_map() loses the position and connections Tour Operator cached; they are restored.
$GLOBALS['ati_test_transients'] = array(
	'12_location' => array(
		'location' => array( 'latitude' => '-17.93', 'longitude' => '25.82' ),
		'args'     => array( 'latitude' => '-17.93', 'longitude' => '25.82', 'zoom' => '9' ),
	),
	'14_location' => array(
		'location' => array( 'connections' => array( '11', '12' ) ),
		'args'     => array( 'type' => 'route', 'connections' => array( '11', '12' ), 'zoom' => 15 ),
	),
);
$results['args_restores_cached_position']    = $maps->filter_map_args( array( 'longitude' => null, 'latitude' => null, 'zoom' => 15 ), 12 );
$results['args_restores_cached_connections'] = $maps->filter_map_args( array( 'zoom' => 15, 'type' => 'route' ), 14 );
$GLOBALS['ati_test_transients'] = array();

// Migration: 1.x keys to 2.x keys.
$results['migrate_copies_keys']       = $migration->with_2x_keys( array( 'lat' => '-19.0', 'long' => '29.1', 'zoom' => '4' ) );
$results['migrate_empty_writes_keys'] = $migration->with_2x_keys( array( 'lat' => '', 'long' => '' ) );
$results['migrate_keeps_2x_values']   = $migration->with_2x_keys( array( 'latitude' => '1', 'longitude' => '2', 'lat' => '9', 'long' => '8' ) );

echo json_encode( $results );
