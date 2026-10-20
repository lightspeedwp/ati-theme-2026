/**
 * Google maps: the "Click here to display the map" plate loads a real map.
 *
 * Tour Operator renders the map lazily: a cover plate (`.lsx-map-preview`) with
 * an `href="#"` link, and the marker data (`.lsx-map .lsx-map-details`) that its
 * maps.js turns into a Google map on click. Two regressions are covered:
 *
 * - The click does nothing but jump to the top of the page. TO 2.2 emits the
 *   map data without the `.lsx-map` container maps.js needs, so the click
 *   handler was never bound (theme: ati_theme_2026_wrap_map_details()).
 * - The map opens on the wrong place. WETU imported coordinates as
 *   `location[lat|long]`; TO reads `latitude|longitude`, so maps centred on
 *   TO's Cape Town default (-33.914482, 18.3758789) with empty markers.
 *
 * Read-only: GETs to dev, plus Google's map tiles once a plate is clicked.
 *
 * @package ATI_Theme_2026
 * @subpackage Tests
 */

const { test, expect, readResolvedRoutes } = require( '../fixtures/base.js' );
const { acceptCookies } = require( '../utils/helpers.js' );

const ROUTES = readResolvedRoutes();

/**
 * Tour Operator's fallback centre when a post has no usable coordinates.
 */
const TO_DEFAULT_LAT = '-33.914482';

/**
 * Pages to check: Zimbabwe (reported broken), then two resolved samples of each
 * map-bearing post type.
 */
const PAGES = [
	{ name: 'country: Zimbabwe', path: '/destination/zimbabwe/' },
	...[ 'country', 'region', 'tour', 'accommodation' ].flatMap( ( key ) =>
		( ROUTES.samples[ key ] || [] ).slice( 0, 2 ).map( ( path ) => ( { name: `${ key }: ${ path }`, path } ) )
	),
];

test.describe( 'Google maps', () => {
	for ( const target of PAGES ) {
		test( `${ target.name } — the map plate opens a map with real coordinates`, async ( { page, visit } ) => {
			await visit( target.path );
			await acceptCookies( page );

			const plate = page.locator( '.lsx-location-wrapper .lsx-map-preview a' ).first();

			test.skip( 0 === ( await plate.count() ), 'no map on this page (Tour Operator hides it without location data)' );

			const details = page.locator( '.lsx-map .lsx-map-details' ).first();

			await expect( details, 'map data is not inside .lsx-map, so maps.js never binds the plate' ).toHaveCount( 1 );

			const data = await details.evaluate( ( el ) => ( {
				type: el.dataset.type,
				lat: el.dataset.lat,
				markers: [ ...el.querySelectorAll( '.map-data' ) ].map( ( m ) => ( {
					title: m.dataset.title,
					lat: m.dataset.lat,
					long: m.dataset.long,
				} ) ),
			} ) );

			const empty = data.markers.filter( ( m ) => ! m.lat || ! m.long ).map( ( m ) => m.title );

			expect( empty, `map markers with no coordinates: ${ empty.join( ', ' ) }` ).toEqual( [] );

			if ( 0 === data.markers.length ) {
				expect( data.lat, 'the map centres on Tour Operator\'s Cape Town default: the post has no latitude/longitude' ).not.toBe( TO_DEFAULT_LAT );
			}

			await plate.scrollIntoViewIfNeeded();
			const before = await page.evaluate( () => window.scrollY );

			await plate.click();

			await expect(
				page.locator( '.lsx-map-preview .gm-style' ).first(),
				'clicking the plate did not load a Google map'
			).toBeVisible( { timeout: 20 * 1000 } );

			const after = await page.evaluate( () => window.scrollY );

			expect( Math.abs( after - before ), 'clicking the plate scrolled the page (the href="#" was followed)' ).toBeLessThan( 50 );
		} );
	}
} );
