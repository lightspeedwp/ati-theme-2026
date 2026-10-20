/**
 * Dev-vs-live CONTENT parity, on a sample of every post type and every static
 * page.
 *
 * Opt-in: `npm run test:parity` (ATI_RUN_PARITY=true). It reads
 * https://ati-holidays.com — the client's production site — so it is serial,
 * GET-only, paused between requests and cached on disk (utils/live.js).
 *
 * Dev and live are meant to hold "pretty much the same content" apart from the
 * visual redesign. Live may be newer than dev (the client keeps editing), and a
 * resync happens before deploy, so stale content must not fail the run. Each
 * page is therefore compared on content, not markup, and every difference is
 * classified (utils/compare.js):
 *
 *   MISSING_ON_DEV  live shows it, dev does not — a likely theme/binding bug.
 *                   FAILS the page unless listed in fixtures/known-pending.js.
 *   CONTENT_DRIFT   both show it, text differs — probably stale; warning.
 *   EXTRA_ON_DEV    dev only — informational.
 *   KNOWN_PENDING   a fix is in the working tree but not deployed yet.
 *   STALE           live 404/redirect, or a live-only related item.
 *
 * The readable summary is written to tests/e2e/test-results/parity-report.{md,html}
 * by reporters/parity-report.js, grouped by type → page → field.
 *
 * @package ATI_Theme_2026
 * @subpackage Tests
 */

const { test, expect } = require( '../fixtures/parity.js' );
const { readResolvedRoutes } = require( '../fixtures/base.js' );
const { buildPairs, comparePair } = require( '../utils/parity.js' );

const PAIRS = buildPairs( readResolvedRoutes() );

test.describe( 'Content parity with live @parity', () => {
	for ( const pair of PAIRS ) {
		test( pair.name, async ( { page, request, live, devIndex }, testInfo ) => {
			const record = await comparePair( { page, request, live, devIndex, pair } );

			await testInfo.attach( 'parity.json', {
				body: JSON.stringify( record ),
				contentType: 'application/json',
			} );

			for ( const [ cls, count ] of Object.entries( record.counts ) ) {
				if ( count ) {
					testInfo.annotations.push( { type: cls, description: String( count ) } );
				}
			}

			const missing = record.diffs
				.filter( ( diff ) => 'MISSING_ON_DEV' === diff.cls )
				.map(
					( diff ) =>
						`${ diff.label } [${ diff.field }] — live: ${ diff.live || '(none)' } | dev: ${ diff.dev || '(none)' }${
							diff.detail ? ` — ${ diff.detail }` : ''
						}`
				);

			expect(
				missing,
				`${ pair.path } shows content on live that dev does not (MISSING_ON_DEV):\n  ` +
					missing.join( '\n  ' )
			).toEqual( [] );
		} );
	}
} );
