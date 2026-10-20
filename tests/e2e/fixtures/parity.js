/**
 * Test fixture for the parity project: a polite live client and the dev index,
 * both worker-scoped so they are built once.
 *
 * @package ATI_Theme_2026
 * @subpackage Tests
 */

const { test: base, readResolvedRoutes } = require( './base.js' );
const { LiveClient } = require( '../utils/live.js' );
const { loadDevIndex } = require( '../utils/parity.js' );

const test = base.extend( {
	live: [
		// eslint-disable-next-line no-empty-pattern
		async ( {}, use ) => {
			const client = await LiveClient.create();

			await use( client );

			process.stderr.write(
				`\n  Live requests: ${ client.requests } network, ${ client.cached } from cache\n`
			);
			await client.dispose();
		},
		{ scope: 'worker' },
	],

	devIndex: [
		async ( { playwright }, use ) => {
			// Worker fixtures cannot depend on the test-scoped `baseURL`; global
			// setup recorded the one the config resolved.
			const api = await playwright.request.newContext( {
				baseURL: readResolvedRoutes().baseURL,
			} );

			await use( await loadDevIndex( api ) );
			await api.dispose();
		},
		{ scope: 'worker' },
	],
} );

module.exports = { test, expect: base.expect };
