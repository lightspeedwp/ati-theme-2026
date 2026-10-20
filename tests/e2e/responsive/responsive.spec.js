/**
 * The responsive contract.
 *
 * Breakpoints: mobile 375×667, tablet 768×1024, desktop 1280×800 (and wide
 * 1920×1080 with `ATI_RUN_WIDE=true`). Nothing here compares a breakpoint
 * against a separate comp; these are adaptation failures — a layout that
 * overflows, a control too small to hit, a page that collapses when the reader
 * turns the browser font up.
 *
 * @package ATI_Theme_2026
 * @subpackage Tests
 */

const { test, expect } = require( '../fixtures/base.js' );
const { documentWidths, overflowCulprits } = require( '../utils/page-contract.js' );
const { readResolvedRoutes } = require( '../fixtures/base.js' );

const BREAKPOINTS = [
	{ name: 'mobile', width: 375, height: 667 },
	{ name: 'tablet', width: 768, height: 1024 },
	{ name: 'desktop', width: 1280, height: 800 },
	...( 'true' === process.env.ATI_RUN_WIDE ? [ { name: 'wide', width: 1920, height: 1080 } ] : [] ),
];

const ROUTES = readResolvedRoutes();

/**
 * A sample, not everything: breakpoints × pages multiplies, and overflow bugs
 * cluster by template. Every static page is covered at 375px in
 * templates/static-pages.spec.js.
 */
const SAMPLE = [
	[ 'front page', '/' ],
	[ 'tour archive', '/tours/' ],
	[ 'accommodation archive', '/accommodation/' ],
	[ 'destination archive', '/destinations/' ],
	[ 'reviews archive', '/reviews/' ],
	[ 'single tour', ROUTES.posts.tour ],
	[ 'single accommodation', ROUTES.posts.accommodation ],
	[ 'single country', ROUTES.posts.country ],
	[ 'single region', ROUTES.posts.region ],
	[ 'single review', ROUTES.posts.review ],
	[ 'single special', ROUTES.posts.special ],
	[ 'single team member', ROUTES.posts.team ],
	[ 'single post', ROUTES.posts.post ],
	[ 'travel style archive', ROUTES.terms[ 'travel-style' ] ],
	[ 'contact', '/contact-us/' ],
].filter( ( [ , path ] ) => path );

/**
 * WCAG 2.5.8 (Target Size, Minimum, AA): 24×24 CSS px. (44×44 is the AAA
 * criterion, 2.5.5; the org standard quotes it, but a control above 24 passes AA.)
 */
const MIN_TARGET = 24;

test.describe( 'Responsive layout', () => {
	for ( const breakpoint of BREAKPOINTS ) {
		test.describe( `${ breakpoint.name } (${ breakpoint.width }px)`, () => {
			test.use( { viewport: { width: breakpoint.width, height: breakpoint.height } } );

			for ( const [ name, path ] of SAMPLE ) {
				test( `${ name } does not scroll horizontally`, async ( { page, visit } ) => {
					await visit( path );

					const { scrollWidth, clientWidth } = await documentWidths( page );

					expect(
						scrollWidth,
						`${ path } overflows at ${ breakpoint.width }px (document ${ scrollWidth }px in a ${ clientWidth }px viewport). ${ ( await overflowCulprits( page ) ).join( ' | ' ) }`
					).toBeLessThanOrEqual( clientWidth + 1 );
				} );
			}
		} );
	}
} );

test.describe( 'Touch targets', () => {
	test.use( { viewport: { width: 375, height: 667 } } );

	test( 'header controls meet the 24×24 minimum target size (WCAG 2.5.8)', async ( { page, visit } ) => {
		await visit( '/' );

		const undersized = await page
			.locator( 'header a[href], header button, header input:not([type="hidden"])' )
			.evaluateAll( ( nodes, minimum ) =>
				nodes
					.filter( ( node ) => {
						const rect = node.getBoundingClientRect();

						return 0 < rect.width && 0 < rect.height && ( rect.width < minimum || rect.height < minimum );
					} )
					.filter( ( node ) => 'hidden' !== getComputedStyle( node ).visibility )
					.map( ( node ) => {
						const rect = node.getBoundingClientRect();

						return `${ ( node.getAttribute( 'aria-label' ) || node.textContent || node.outerHTML ).trim().slice( 0, 40 ) } — ${ Math.round( rect.width ) }×${ Math.round( rect.height ) }`;
					} ),
				MIN_TARGET
			);

		expect( undersized, `header controls below ${ MIN_TARGET }×${ MIN_TARGET }px:\n  ${ undersized.join( '\n  ' ) }` ).toEqual( [] );
	} );
} );

test.describe( 'Browser font scaling', () => {
	for ( const scale of [ 120, 150 ] ) {
		test( `the front page survives ${ scale }% text scaling`, async ( { page, visit } ) => {
			await page.setViewportSize( { width: 375, height: 667 } );
			await visit( '/' );

			await page.evaluate( ( percentage ) => {
				document.documentElement.style.fontSize = `${ ( 16 * percentage ) / 100 }px`;
			}, scale );
			await page.evaluate( () => document.fonts.ready );

			await expect
				.poll( async () => {
					const { scrollWidth, clientWidth } = await documentWidths( page );

					return scrollWidth - clientWidth;
				}, { message: `the front page overflows at ${ scale }% text size` } )
				.toBeLessThanOrEqual( 1 );
		} );
	}
} );
