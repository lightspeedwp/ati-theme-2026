/**
 * Minimal .env loader and target guards.
 *
 * Playwright does not read .env by itself, and base URLs / credentials must not
 * live in source. `dotenv` would do, but it is twenty lines and not worth a
 * dependency. Values already present in `process.env` win, so a one-off
 * `WP_BASE_URL=… npm run test:e2e` still overrides the file.
 *
 * @package ATI_Theme_2026
 * @subpackage Tests
 */

const fs = require( 'fs' );
const path = require( 'path' );

const ENV_PATH = path.join( __dirname, '..', '..', '..', '.env' );

/**
 * Hosts the suite may run against. An allowlist, not just a production
 * denylist: the free-text WP_BASE_URL must never send a request (or an
 * Authorization header) to an arbitrary host.
 */
const ALLOWED_HOSTS = [
	'ati-holidays.lightspeedwp.dev',
	'ati-holidays.local',
	'localhost',
	'127.0.0.1',
];

/**
 * Production. Never a baseURL; the opt-in `parity` project reads it with plain
 * GETs through utils/live.js only.
 */
const PRODUCTION_HOSTS = [ 'ati-holidays.com', 'www.ati-holidays.com' ];

/**
 * Read .env from the theme root into process.env.
 *
 * Handles `KEY=value`, `KEY='value'` and `KEY="value"`. An empty value is
 * ignored, so `WP_REST_AUTH=` in .env.example does not shadow anything.
 *
 * @return {void}
 */
function loadEnv() {
	if ( ! fs.existsSync( ENV_PATH ) ) {
		return;
	}

	for ( const line of fs.readFileSync( ENV_PATH, 'utf8' ).split( '\n' ) ) {
		const trimmed = line.trim();

		if ( '' === trimmed || trimmed.startsWith( '#' ) ) {
			continue;
		}

		const at = trimmed.indexOf( '=' );

		if ( 0 >= at ) {
			continue;
		}

		const key = trimmed.slice( 0, at ).trim();

		if ( key in process.env ) {
			continue;
		}

		let value = trimmed.slice( at + 1 ).trim();

		if (
			( value.startsWith( "'" ) && value.endsWith( "'" ) ) ||
			( value.startsWith( '"' ) && value.endsWith( '"' ) )
		) {
			value = value.slice( 1, -1 );
		}

		if ( '' !== value ) {
			process.env[ key ] = value;
		}
	}
}

/**
 * @param {string} baseURL Target URL.
 * @return {string} Hostname, or '' when unparseable.
 */
function hostOf( baseURL ) {
	try {
		return new URL( baseURL ).hostname;
	} catch {
		return '';
	}
}

/**
 * Throw unless the URL is an approved, non-production target.
 *
 * @param {string} baseURL Target URL.
 * @return {void}
 */
function assertSafeTarget( baseURL ) {
	const host = hostOf( baseURL );

	if ( PRODUCTION_HOSTS.includes( host ) ) {
		throw new Error(
			'Refusing to run: WP_BASE_URL points at the production site (ati-holidays.com). Use dev or local.'
		);
	}

	if ( ! ALLOWED_HOSTS.includes( host ) ) {
		throw new Error(
			`Refusing to run: WP_BASE_URL host "${ host || baseURL }" is not an approved target (${ ALLOWED_HOSTS.join(
				', '
			) }).`
		);
	}
}

/**
 * @return {boolean} True when a REST Authorization header is configured.
 */
function hasRestAuth() {
	return Boolean( process.env.WP_REST_AUTH );
}

module.exports = {
	loadEnv,
	hostOf,
	assertSafeTarget,
	hasRestAuth,
	ALLOWED_HOSTS,
	PRODUCTION_HOSTS,
	ENV_PATH,
};
