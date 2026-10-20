/**
 * Dev and live side by side: a full-page screenshot of each, one page per
 * template, for a human to compare.
 *
 * The rebuild deliberately changes the design and tightens accessibility, so a
 * pixel diff would fail on every page and prove nothing. What it cannot catch,
 * a reviewer spots in seconds when the two are next to each other: a section
 * that is gone, a card that lost its image, a box that renders empty. These
 * tests never fail on appearance; the screenshots go into the parity report
 * (tests/e2e/test-results/parity-report.html, "Side by side").
 *
 * Doubly opt-in, because unlike the rest of the parity project it loads live in
 * a real browser (assets and all): ATI_RUN_PARITY=true and ATI_PARITY_VISUAL=true,
 * i.e. `npm run test:parity:visual`. One page per template, serial, GET only:
 * any other request to live is aborted.
 *
 * @package ATI_Theme_2026
 * @subpackage Tests
 */

const { test, expect, readResolvedRoutes } = require( '../fixtures/base.js' );
const { acceptCookies } = require( '../utils/helpers.js' );
const { scrollThrough } = require( '../utils/page-contract.js' );
const { LIVE_ORIGIN, LIVE_HOSTS } = require( '../utils/live.js' );

const RUN = 'true' === process.env.ATI_PARITY_VISUAL;
const ROUTES = readResolvedRoutes();

/**
 * One page per template: home, the main archives, the first sample of each
 * post type, and the first static page.
 */
const PAGES = [
	{ type: 'home', path: '/' },
	{ type: 'archive', path: '/tours/' },
	{ type: 'archive', path: '/destinations/' },
	...[
		'tour',
		'accommodation',
		'country',
		'region',
		'review',
		'special',
		'team',
		'post',
	]
		.map( ( key ) => ( {
			type: key,
			path: ( ROUTES.samples[ key ] || [] )[ 0 ],
		} ) )
		.filter( ( entry ) => entry.path ),
	...( ROUTES.pages || [] )
		.slice( 0, 1 )
		.map( ( entry ) => ( { type: 'page', path: entry.path } ) ),
];

/**
 * A full-page screenshot, capped in height: Chrome cannot capture very tall
 * pages in one image ("Unable to capture screenshot"), and the top of a page
 * shows most of what a side-by-side review needs.
 *
 * @param {import('@playwright/test').Page} page Page.
 * @return {Promise<Buffer>} PNG.
 */
async function capture( page ) {
	const { width, height } = await page.evaluate( () => ( {
		width: document.documentElement.clientWidth,
		height: document.documentElement.scrollHeight,
	} ) );

	return page.screenshot( {
		fullPage: true,
		clip: { x: 0, y: 0, width, height: Math.min( height, 12000 ) },
		timeout: 30 * 1000,
	} );
}

/**
 * Bring a page to its settled, fully-loaded state before the screenshot.
 *
 * @param {import('@playwright/test').Page} page Page.
 */
async function settle( page ) {
	await acceptCookies( page );
	await scrollThrough( page );
	await page.evaluate( () => window.scrollTo( 0, 0 ) );
	// Displayed images finish loading after the scroll has requested them.
	// Images in closed menus or modals never load, so only rendered ones count,
	// and a slow image must not cost the screenshot.
	await page
		.waitForFunction(
			() =>
				Array.from( document.images )
					.filter( ( img ) => img.getClientRects().length )
					.every( ( img ) => img.complete ),
			null,
			{ timeout: 15 * 1000 }
		)
		.catch( () => {} );
}

test.describe( 'Side by side with live @parity', () => {
	for ( const target of PAGES ) {
		test( `${ target.type }: ${ target.path }`, async ( {
			page,
			visit,
			browser,
		}, testInfo ) => {
			test.skip(
				! RUN,
				'set ATI_PARITY_VISUAL=true (npm run test:parity:visual)'
			);

			const viewport = page.viewportSize();

			await visit( target.path );
			await settle( page );
			await testInfo.attach( 'visual-dev.png', {
				body: await capture( page ),
				contentType: 'image/png',
			} );

			const context = await browser.newContext( { viewport } );
			const livePage = await context.newPage();

			// Read-only on production: anything but a GET to live is refused.
			await livePage.route( '**/*', ( route ) =>
				'GET' !== route.request().method() &&
				LIVE_HOSTS.includes( new URL( route.request().url() ).hostname )
					? route.abort()
					: route.continue()
			);

			const response = await livePage.goto( LIVE_ORIGIN + target.path, {
				waitUntil: 'load',
				timeout: 60 * 1000,
			} );

			expect(
				response && response.status(),
				`live ${ target.path }`
			).toBeLessThan( 400 );

			await settle( livePage );
			await testInfo.attach( 'visual-live.png', {
				body: await capture( livePage ),
				contentType: 'image/png',
			} );
			await testInfo.attach( 'visual.json', {
				body: JSON.stringify( target ),
				contentType: 'application/json',
			} );

			await context.close();
		} );
	}
} );
