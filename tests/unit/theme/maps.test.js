/**
 * Tour Operator Google maps (inc/class-ati-to-google-maps.php and the
 * location migration), run through tests/unit/php/maps-harness.php.
 *
 * The rule under test: a map section shows only when its map can place
 * something (a marker with coordinates, the post's own position, or a KML
 * route). A tour, accommodation or destination with no map gets no map section.
 *
 * @package ATI_Theme_2026
 * @subpackage Tests
 */

import { beforeAll, describe, expect, it } from 'vitest';

import { spawnSync } from 'node:child_process';
import { themePath } from '../helpers/theme-files';

const HAS_PHP = 0 === spawnSync( 'php', [ '-v' ] ).status;

let results = {};

beforeAll( () => {
	if ( ! HAS_PHP ) {
		return;
	}

	const run = spawnSync( 'php', [ themePath( 'tests/unit/php/maps-harness.php' ) ], { encoding: 'utf8' } );

	expect( run.status, run.stderr ).toBe( 0 );
	results = JSON.parse( run.stdout );
} );

describe.skipIf( ! HAS_PHP )( 'map section visibility', () => {
	it.each( [
		[ 'section_markers_with_coordinates', 'a marker with coordinates' ],
		[ 'section_own_position_no_markers', 'the post\'s own position' ],
		[ 'section_kml_route', 'a KML route' ],
	] )( 'keeps the section when the map has %s (%s)', ( key ) => {
		expect( results[ key ] ).toBe( 'kept' );
	} );

	it.each( [
		[ 'section_markers_all_empty', 'every marker lacks coordinates' ],
		[ 'section_default_position_only', 'only Tour Operator\'s Cape Town default position' ],
		[ 'section_empty_position', 'an empty position' ],
		[ 'section_plate_without_map_data', 'a plate but no map data' ],
	] )( 'removes the section when %s (%s)', ( key ) => {
		expect( results[ key ] ).toBe( 'removed' );
	} );

	it( 'leaves WETU maps and unrelated blocks alone', () => {
		expect( results.section_wetu_map ).toBe( 'kept' );
		expect( results.section_other_group ).toBe( 'kept' );
		expect( results.section_other_block ).toBe( 'kept' );
	} );
} );

describe.skipIf( ! HAS_PHP )( 'map arguments', () => {
	it( 'drops connections Tour Operator cannot place, and uses the post\'s zoom', () => {
		expect( results.args_drops_unplaceable ).toEqual( { type: 'cluster', connections: [ '12' ], zoom: 4 } );
	} );

	it( 'falls back to the post itself when no connection can be placed', () => {
		expect( results.args_falls_back_to_post ).toEqual( { type: 'single', zoom: 4, latitude: '-19.0', longitude: '29.1' } );
	} );

	it( 'keeps a zoom set manually in Tour Operator', () => {
		expect( results.args_manual_zoom_kept.zoom ).toBe( 9 );
	} );

	it( 'restores the position Tour Operator cached but lsx_to_map() lost (accommodation maps)', () => {
		expect( results.args_restores_cached_position ).toMatchObject( { latitude: '-17.93', longitude: '25.82' } );
	} );

	it( 'restores the itinerary stops Tour Operator cached but lsx_to_map() lost (tour route maps)', () => {
		expect( results.args_restores_cached_connections ).toMatchObject( { type: 'route', connections: [ '12' ] } );
	} );

	it( 'leaves the arguments alone when nothing can be placed (the section is removed instead)', () => {
		expect( results.args_nothing_placeable.connections ).toEqual( [ '11' ] );
	} );
} );

describe.skipIf( ! HAS_PHP )( 'location migration (Tour Operator 1.x to 2.x keys)', () => {
	it( 'copies lat/long to latitude/longitude and keeps the originals', () => {
		expect( results.migrate_copies_keys ).toMatchObject( { lat: '-19.0', long: '29.1', latitude: '-19.0', longitude: '29.1', zoom: '4' } );
	} );

	it( 'always writes both 2.x keys, empty when there are no coordinates', () => {
		expect( results.migrate_empty_writes_keys ).toMatchObject( { latitude: '', longitude: '' } );
	} );

	it( 'does not overwrite existing 2.x values', () => {
		expect( results.migrate_keeps_2x_values ).toMatchObject( { latitude: '1', longitude: '2' } );
	} );
} );
