/**
 * The base test fixture.
 *
 * Every spec imports `test` from here rather than from `@playwright/test`. That
 * buys, on every page the suite visits:
 *
 *   1. A READ-ONLY guard (auto). Any non-GET request to the target origin is
 *      intercepted and answered with an empty 200 — it never reaches the
 *      server. The dev site is under client review; the suite must not be able
 *      to send an enquiry, create a draft or hit an admin-ajax write even by
 *      accident. Blocked writes are recorded and annotated on the test.
 *   2. Cache bypass (auto). Reads past the page cache, so the suite tests what
 *      the theme renders now.
 *   3. A console guard that *collects* console errors and uncaught exceptions
 *      (third-party noise allowlisted). It is opt-in per spec through
 *      `consoleGuard.assertClean()`, so one site-wide script error does not
 *      turn every spec red; the specs that care about it assert.
 *   4. `visit()`: navigate, check status, and fail on PHP warnings/fatals in
 *      the markup.
 *   5. Resolved routes from global-setup.js.
 *
 * @package ATI_Theme_2026
 * @subpackage Tests
 */

const fs = require( 'fs' );
const path = require( 'path' );
const base = require( '@playwright/test' );

const CACHE_PATH = path.join( __dirname, '..', '.resolved-routes.json' );

/**
 * Markup that means PHP spoke when it should not have.
 */
const PHP_ERROR_PATTERNS = [
	/<b>(Warning|Notice|Fatal error|Parse error|Deprecated)<\/b>:/i,
	/\b(Fatal error|Parse error):\s/i,
	/\bUncaught\s+(Error|TypeError|ArgumentCountError)\b/i,
	/There has been a critical error on this website/i,
	/Cannot modify header information/i,
	/\bWarning:\s+(Undefined|Trying to access|Array to string|foreach\(\))/i,
	/\bDeprecated:\s+\S+\s+(is|has been) deprecated/i,
];

/**
 * Console noise we do not own and will not fix, matched as a substring of the
 * message or its source URL. Anything not listed fails — the theme's own
 * console errors should be zero.
 */
const CONSOLE_ALLOWLIST = [
	'trustpilot',
	'connect.facebook.net',
	'facebook.com/tr',
	'google-analytics.com',
	'googletagmanager.com',
	'doubleclick.net',
	'analytics.tiktok.com',
	'linkedin.com',
	'wetu.com',
	'staticstuff.net',
	'maps.googleapis.com',
	'Google Maps JavaScript API',
	'ERR_BLOCKED_BY_CLIENT',
	'ERR_QUIC_PROTOCOL_ERROR',
	'favicon.ico',
	// CookieYes / consent-log endpoints.
	'cookieyes.com',
	'cookie-law-info',
];

/**
 * @param {string} text Message or URL.
 * @return {boolean} True when it is known third-party noise.
 */
function isAllowedConsoleNoise( text ) {
	const haystack = String( text ).toLowerCase();

	return CONSOLE_ALLOWLIST.some( ( needle ) =>
		haystack.includes( needle.toLowerCase() )
	);
}

/**
 * @param {string} url URL or path.
 * @return {string} Pathname only.
 */
function toPathname( url ) {
	try {
		return new URL( url, 'http://placeholder.invalid' ).pathname;
	} catch {
		return String( url ).split( '?' )[ 0 ].split( '#' )[ 0 ];
	}
}

/**
 * @return {Object} Resolved route cache.
 */
function readResolvedRoutes() {
	if ( ! fs.existsSync( CACHE_PATH ) ) {
		throw new Error(
			'No resolved routes. global-setup.js did not run — are you invoking playwright from the theme root?'
		);
	}

	return JSON.parse( fs.readFileSync( CACHE_PATH, 'utf8' ) );
}

const test = base.test.extend( {
	/**
	 * READ-ONLY guard. See the file header.
	 * @param {Object}                                    root0         Fixtures.
	 * @param {import('@playwright/test').BrowserContext} root0.context Browser context.
	 * @param {string}                                    root0.baseURL Site under test.
	 * @param {Function}                                  use           Hands the fixture value to the test.
	 * @param {import('@playwright/test').TestInfo}       testInfo      Current test.
	 */
	readOnlyGuard: [
		async ( { context, baseURL }, use, testInfo ) => {
			const origin = new URL( baseURL ).origin;
			const blocked = [];

			await context.route(
				( url ) => url.origin === origin,
				( route ) => {
					const request = route.request();

					if ( [ 'GET', 'HEAD', 'OPTIONS' ].includes( request.method() ) ) {
						return route.fallback();
					}

					blocked.push( `${ request.method() } ${ toPathname( request.url() ) }` );

					return route.fulfill( {
						status: 200,
						contentType: 'application/json',
						body: '{}',
					} );
				}
			);

			await use( { blocked } );

			if ( blocked.length ) {
				testInfo.annotations.push( {
					type: 'blocked-write',
					description: [ ...new Set( blocked ) ].join( ', ' ),
				} );
			}
		},
		{ auto: true },
	],

	/**
	 * Optional cache bypass (`ATI_BYPASS_CACHE=true`). Dev sits behind a page
	 * cache (`x-cache-status: HIT`) that skips any request carrying a
	 * `comment_author_*` cookie. Off by default: reading through the cache is
	 * faster and gentler on a host the client is reviewing; turn it on after a
	 * deploy to rule out stale cached HTML. A cookie rather than a query string
	 * so no URL a spec asserts on changes.
	 * @param {Object}                                    root0         Fixtures.
	 * @param {import('@playwright/test').BrowserContext} root0.context Browser context.
	 * @param {string}                                    root0.baseURL Site under test.
	 * @param {Function}                                  use           Hands the fixture value to the test.
	 */
	bypassPageCache: [
		async ( { context, baseURL }, use ) => {
			if ( 'true' === process.env.ATI_BYPASS_CACHE ) {
				await context.addCookies( [
					{ name: 'comment_author_ati_e2e', value: '1', url: baseURL },
				] );
			}
			await use();
		},
		{ auto: true },
	],

	/**
	 * Routes resolved at start-up.
	 * @param {Object}   root0 Fixtures.
	 * @param {Function} use   Hands the fixture value to the test.
	 */
	routes: [
		// eslint-disable-next-line no-empty-pattern
		async ( {}, use ) => {
			const resolved = readResolvedRoutes();

			await use( {
				...resolved,
				/** @param {string} key Content type key. @return {string|null} Newest permalink path. */
				post: ( key ) => resolved.posts[ key ] || null,
				/** @param {string} key Content type key. @return {string[]} Spread sample of paths. */
				sample: ( key ) => resolved.samples[ key ] || [],
				/** @param {string} key Taxonomy key. @return {string|null} Term archive path. */
				term: ( key ) => resolved.terms[ key ] || null,
			} );
		},
		{ scope: 'worker' },
	],

	/**
	 * Console errors and uncaught exceptions on the page. Collected always;
	 * asserted only where a spec calls `assertClean()`.
	 * @param {Object}                          root0      Fixtures.
	 * @param {import('@playwright/test').Page} root0.page Page under test.
	 * @param {Function}                        use        Hands the fixture value to the test.
	 * @param {import('@playwright/test').TestInfo} testInfo Current test.
	 */
	consoleGuard: [
		async ( { page }, use, testInfo ) => {
			const errors = [];
			const expectedDocumentFailures = new Set();

			page.on( 'console', ( message ) => {
				if ( 'error' !== message.type() ) {
					return;
				}

				const text = message.text();
				const source = message.location()?.url || '';

				if (
					isAllowedConsoleNoise( text ) ||
					isAllowedConsoleNoise( source ) ||
					expectedDocumentFailures.has( toPathname( source ) )
				) {
					return;
				}

				errors.push( `console.error: ${ text }${ source ? ` (${ source.slice( 0, 120 ) })` : '' }` );
			} );

			page.on( 'pageerror', ( error ) => {
				if ( isAllowedConsoleNoise( error.message ) ) {
					return;
				}

				errors.push( `pageerror: ${ error.message }` );
			} );

			await use( {
				errors,
				/** @param {string} url URL whose own load failure is expected (404 page). */
				allowDocumentError: ( url ) =>
					expectedDocumentFailures.add( toPathname( url ) ),
				/** @param {string} where Label for the message. */
				assertClean( where = 'page' ) {
					base.expect(
						[ ...new Set( errors ) ],
						`browser errors on ${ where }`
					).toEqual( [] );
				},
			} );

			if ( errors.length ) {
				testInfo.annotations.push( {
					type: 'console-errors',
					description: [ ...new Set( errors ) ].join( ' | ' ).slice( 0, 600 ),
				} );
			}
		},
		{ auto: true },
	],

	/**
	 * Navigate and assert the page is structurally sound: status as expected,
	 * no PHP error text in the markup. Every navigation in the suite should go
	 * through this rather than `page.goto`.
	 * @param {Object}                          root0              Fixtures.
	 * @param {import('@playwright/test').Page} root0.page         Page under test.
	 * @param {Object}                          root0.consoleGuard Console guard.
	 * @param {Function}                        use                Hands the fixture value to the test.
	 */
	visit: async ( { page, consoleGuard }, use ) => {
		/**
		 * @param {string} url                    Path to visit.
		 * @param {Object} [options]              Options.
		 * @param {number} [options.expectStatus] Expected HTTP status.
		 * @param {string} [options.waitUntil]    Load state to wait for.
		 * @return {Promise<import('@playwright/test').Response>} The response.
		 */
		const visit = async ( url, options = {} ) => {
			const { expectStatus = 200, waitUntil = 'load' } = options;

			if ( 200 !== expectStatus ) {
				consoleGuard.allowDocumentError( url );
			}

			const response = await page.goto( url, { waitUntil } );

			base.expect( response, `no response for ${ url }` ).not.toBeNull();
			base.expect( response.status(), `unexpected status for ${ url }` ).toBe(
				expectStatus
			);

			const html = await page.content();

			for ( const pattern of PHP_ERROR_PATTERNS ) {
				const match = html.match( pattern );

				if ( match ) {
					const at = html.indexOf( match[ 0 ] );
					const excerpt = html
						.slice( Math.max( 0, at - 120 ), at + 320 )
						.replace( /\s+/g, ' ' );

					throw new Error( `PHP error text in markup at ${ url }:\n  …${ excerpt }…` );
				}
			}

			return response;
		};

		await use( visit );
	},
} );

module.exports = {
	test,
	expect: base.expect,
	PHP_ERROR_PATTERNS,
	CONSOLE_ALLOWLIST,
	readResolvedRoutes,
};
