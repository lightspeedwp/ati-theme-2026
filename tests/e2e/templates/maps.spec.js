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

/**
 * Published posts on dev with no map: no position of their own, nothing
 * placeable connected, no KML route (checked against dev data 2026-10-20, after
 * `wp ati-maps migrate-locations`). If one gains a location, swap it for another.
 */
const NO_MAP = [
	{ name: 'accommodation: Luwi Bush Camp', path: '/accommodation/luwi-bush-camp/' },
	{ name: 'accommodation: Naankuse Lodge', path: '/accommodation/naankuse-lodge/' },
	{ name: 'region: Rundu', path: '/destination/namibia/rundu/' },
	{ name: 'region: Nxai Pan', path: '/destination/botswana/nxai-pan/' },
	{ name: 'tour: 7 Night Seychelles Island Escape', path: '/tour/7-night-seychelles-island-escape/' },
	{ name: 'tour: 6 Night Seychelles Luxury Retreat', path: '/tour/6-night-seychelles-luxury-retreat/' },
];

test.describe( 'No map, no map section', () => {
	for ( const target of NO_MAP ) {
		test( `${ target.name } — shows no map section, plate or Map menu item`, async ( { page, visit } ) => {
			await visit( target.path );

			await expect( page.locator( '.lsx-location-wrapper' ), 'a map section rendered for a post with no map' ).toHaveCount( 0 );
			await expect( page.locator( '.lsx-map-preview' ), '"Click here to display the map" rendered with no map behind it' ).toHaveCount( 0 );
			await expect( page.locator( '[data-sticky-menu-section]#map' ), 'the sticky menu would offer a Map section' ).toHaveCount( 0 );
		} );
	}
} );

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

			await plate.click();

			await expect(
				page.locator( '.lsx-map-preview .gm-style' ).first(),
				'clicking the plate did not load a Google map'
			).toBeVisible( { timeout: 20 * 1000 } );

			// The regression is the `href="#"` being followed: the page jumps to the
			// top and the map is scrolled out of view. (Comparing scroll offsets
			// around the click is unreliable: click() may itself scroll the plate.)
			expect( await page.evaluate( () => window.scrollY ), 'clicking the plate jumped to the top of the page' ).toBeGreaterThan( 0 );
			await expect( page.locator( '.lsx-map-preview' ).first(), 'the map is no longer on screen after the click' ).toBeInViewport();
		} );
	}
} );
