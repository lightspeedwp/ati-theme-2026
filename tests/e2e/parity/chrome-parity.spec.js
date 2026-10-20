/**
 * Dev-vs-live parity of the site chrome: main menu (every top-level item and
 * every dropdown link and its target), top-bar contacts, footer links and
 * social profiles.
 *
 * Opt-in with the rest of the parity project (`npm run test:parity`). Compared
 * once, on the home page, because the chrome is the same on every page.
 *
 * Fails on MISSING_ON_DEV: a menu item, dropdown link, contact or footer link
 * live has and dev does not, an empty dropdown, or a dropdown link whose target
 * differs from live's. Deliberate differences go in
 * fixtures/intentional-differences.js (field `chrome.*`).
 *
 * @package ATI_Theme_2026
 * @subpackage Tests
 */

const { test, expect } = require( '../fixtures/parity.js' );
const { devHeaders } = require( '../utils/helpers.js' );
const { extractChrome, compareChrome } = require( '../utils/chrome.js' );

test.describe( 'Chrome parity with live @parity', () => {
	test( 'header menus, top bar and footer match live', async ( {
		page,
		request,
		live,
	}, testInfo ) => {
		const dev = await request.get( '/', { headers: devHeaders() } );
		const liveResult = await live.get( '/' );

		expect( dev.status(), 'dev home page' ).toBe( 200 );
		expect( liveResult.status, 'live home page' ).toBe( 200 );

		await page.goto( 'about:blank' );

		const liveChrome = await page.evaluate( extractChrome, {
			html: liveResult.html,
			side: 'live',
		} );
		const devChrome = await page.evaluate( extractChrome, {
			html: await dev.text(),
			side: 'dev',
		} );

		expect(
			liveChrome.menu.length,
			"could not read live's main menu — has its markup changed? (utils/chrome.js)"
		).toBeGreaterThan( 0 );
		expect(
			devChrome.menu.length,
			"could not read dev's main menu (utils/chrome.js)"
		).toBeGreaterThan( 0 );

		const diffs = compareChrome( liveChrome, devChrome );
		const counts = diffs.reduce(
			( all, d ) => ( { ...all, [ d.cls ]: ( all[ d.cls ] || 0 ) + 1 } ),
			{}
		);

		await testInfo.attach( 'parity.json', {
			body: JSON.stringify( {
				type: 'chrome',
				path: '/ (header and footer)',
				listing: false,
				devStatus: dev.status(),
				liveStatus: liveResult.status,
				liveFinalPath: liveResult.finalPath,
				similarity: null,
				diffs,
				counts,
			} ),
			contentType: 'application/json',
		} );

		const missing = diffs
			.filter( ( d ) => 'MISSING_ON_DEV' === d.cls )
			.map(
				( d ) =>
					`${ d.label } — live: ${ d.live || '(none)' } | dev: ${ d.dev || '(none)' }${ d.detail ? ` — ${ d.detail }` : '' }`
			);

		expect(
			missing,
			`the header or footer differs from live:\n  ${ missing.join( '\n  ' ) }`
		).toEqual( [] );
	} );
} );
