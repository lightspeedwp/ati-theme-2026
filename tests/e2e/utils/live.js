/**
 * Read-only access to the live production site, for the `parity` project only.
 *
 * ati-holidays.com is the client's production site (the old LSX classic theme).
 * It is NEVER a `baseURL` and nothing in the suite may write to it. This module
 * is the only code that talks to it, and it:
 *
 *   - issues GET requests only (there is no other method on this class);
 *   - refuses any host other than ati-holidays.com / www.ati-holidays.com;
 *   - pauses between network requests (`ATI_LIVE_DELAY`, default 450 ms);
 *   - caps the requests per run (`ATI_PARITY_MAX_LIVE`, default 400);
 *   - follows redirects (a redirect is information, not an error) and records
 *     where it ended up;
 *   - caches every response on disk for `ATI_PARITY_TTL_HOURS` (default 12), so
 *     re-running the suite while iterating costs the client nothing.
 *     `ATI_PARITY_REFRESH=true` ignores the cache.
 *
 * @package ATI_Theme_2026
 * @subpackage Tests
 */

const crypto = require( 'crypto' );
const fs = require( 'fs' );
const path = require( 'path' );
const { request } = require( '@playwright/test' );

const LIVE_ORIGIN = process.env.ATI_LIVE_URL || 'https://ati-holidays.com';
const LIVE_HOSTS = [ 'ati-holidays.com', 'www.ati-holidays.com' ];
const CACHE_DIR = path.join( __dirname, '..', '.parity-cache' );
const DELAY = parseInt( process.env.ATI_LIVE_DELAY || '450', 10 );
const MAX_REQUESTS = parseInt( process.env.ATI_PARITY_MAX_LIVE || '400', 10 );
const TTL_MS = parseFloat( process.env.ATI_PARITY_TTL_HOURS || '12' ) * 3600 * 1000;
const REFRESH = 'true' === process.env.ATI_PARITY_REFRESH;

/**
 * Identifies the suite in live's access logs without a custom header (a custom
 * header on a browser page breaks CORS preflight; this is an API request, but a
 * plain UA is the conventional, least surprising signal).
 */
const USER_AGENT =
	'Mozilla/5.0 (compatible; ati-theme-e2e-parity/1.0; read-only content comparison)';

class LiveClient {
	/**
	 * @param {import('@playwright/test').APIRequestContext} api Request context bound to live.
	 */
	constructor( api ) {
		this.api = api;
		this.requests = 0;
		this.cached = 0;
		fs.mkdirSync( CACHE_DIR, { recursive: true } );
	}

	/**
	 * @return {Promise<LiveClient>} A client with its own request context.
	 */
	static async create() {
		const host = new URL( LIVE_ORIGIN ).hostname;

		if ( ! LIVE_HOSTS.includes( host ) ) {
			throw new Error( `Refusing: ATI_LIVE_URL host "${ host }" is not ati-holidays.com.` );
		}

		const api = await request.newContext( {
			baseURL: LIVE_ORIGIN,
			extraHTTPHeaders: { 'User-Agent': USER_AGENT },
			timeout: 45 * 1000,
			maxRedirects: 0, // followed by hand so every hop stays on-host and is counted
		} );

		return new LiveClient( api );
	}

	/**
	 * GET a path on live, following same-host redirects.
	 *
	 * @param {string} pathname Path with a leading slash (and optional query).
	 * @return {Promise<{status: number, finalPath: string, redirected: boolean, html: string, cached: boolean}>} Result.
	 */
	async get( pathname ) {
		if ( ! pathname.startsWith( '/' ) ) {
			throw new Error( `Live paths must start with "/": ${ pathname }` );
		}

		const file = path.join(
			CACHE_DIR,
			`live-${ crypto.createHash( 'sha1' ).update( pathname ).digest( 'hex' ).slice( 0, 16 ) }.json`
		);

		if ( ! REFRESH && fs.existsSync( file ) ) {
			const entry = JSON.parse( fs.readFileSync( file, 'utf8' ) );

			if ( Date.now() - entry.fetchedAt < TTL_MS ) {
				this.cached++;

				return { ...entry.result, cached: true };
			}
		}

		let current = pathname;
		let redirected = false;
		let status = 0;
		let html = '';

		for ( let hop = 0; hop < 5; hop++ ) {
			if ( this.requests >= MAX_REQUESTS ) {
				throw new Error(
					`Live request cap reached (${ MAX_REQUESTS }). Raise ATI_PARITY_MAX_LIVE deliberately if this is intended.`
				);
			}

			await new Promise( ( resolve ) => setTimeout( resolve, DELAY ) );
			this.requests++;

			const response = await this.api.get( current );
			status = response.status();

			if ( [ 301, 302, 303, 307, 308 ].includes( status ) ) {
				const location = response.headers().location || '';
				const next = new URL( location, LIVE_ORIGIN );

				if ( ! LIVE_HOSTS.includes( next.hostname ) ) {
					// Leaves the site (e.g. off to a third party): record, do not follow.
					return { status, finalPath: location, redirected: true, html: '', cached: false, offsite: true };
				}

				current = next.pathname + next.search;
				redirected = true;
				continue;
			}

			html = 200 === status ? await response.text() : '';
			break;
		}

		const result = {
			status,
			finalPath: current,
			redirected: redirected && current.replace( /\/$/, '' ) !== pathname.replace( /\/$/, '' ),
			html,
		};

		fs.writeFileSync( file, JSON.stringify( { fetchedAt: Date.now(), pathname, result } ) );

		return { ...result, cached: false };
	}

	/**
	 * @return {Promise<void>}
	 */
	async dispose() {
		await this.api.dispose();
	}
}

module.exports = { LiveClient, LIVE_ORIGIN, USER_AGENT };
