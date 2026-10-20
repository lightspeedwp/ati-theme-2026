/**
 * Card meta parity: the SET of meta rows each card shows, dev vs live.
 *
 * Live's cards print `.lsx-to-widget-meta-data .lsx-to-meta-data-key` labels
 * (Style:, Type:, Location:, Rooms:, From price:, Duration:, …). Dev's block
 * cards (inside `.wp-block-post-template`) print the same fields as post-terms
 * prefixes and `lsx-info-value` paragraphs. Cards are matched between the two
 * by post id (then slug) and compared on which fields they show.
 *
 * This is the narrow, fast version of content-parity.spec.js, for the bug the
 * team has been chasing: Tour Operator hides a `lsx-<key>-wrapper` row whose key
 * is empty for the post, so a wrapper class that does not match the field bound
 * inside it silently removes the row (e.g. `lsx-duration-wrapper` around a
 * travel-style block; no Location row at all on the accommodation card).
 *
 * Opt-in with the rest of the parity project (`npm run test:parity`).
 *
 * @package ATI_Theme_2026
 * @subpackage Tests
 */

const { test, expect } = require( '../fixtures/parity.js' );
const { readResolvedRoutes } = require( '../fixtures/base.js' );
const { comparePair } = require( '../utils/parity.js' );

const CARD_SAMPLE = Math.max( 1, parseInt( process.env.ATI_CARD_SAMPLE || '3', 10 ) );
const routes = readResolvedRoutes();

/**
 * Pages whose cards are worth checking: singles that list connected
 * accommodation, tours and destinations.
 */
const PAGES = [
	{ type: 'review', key: 'review', pinned: [ '/review/rachel-nigel/' ] },
	{ type: 'accommodation', key: 'accommodation', pinned: [ '/accommodation/camp-silwane/' ] },
	{ type: 'destination', key: 'country' },
	{ type: 'destination', key: 'region' },
	{ type: 'tour', key: 'tour', pinned: [ '/tour/moments-in-zimbabwe-10-nights/' ] },
].flatMap( ( { type, key, pinned = [] } ) =>
	[ ...new Set( [ ...pinned, ...( routes.samples[ key ] || [] ) ] ) ]
		.slice( 0, CARD_SAMPLE + pinned.length )
		.map( ( path ) => ( { type, path, name: `${ type }: ${ path }`, listing: false } ) )
);

test.describe( 'Card meta parity with live @parity', () => {
	for ( const pair of PAGES ) {
		test( `${ pair.name } — cards show the same meta rows as live`, async ( { page, request, live, devIndex }, testInfo ) => {
			const record = await comparePair( { page, request, live, devIndex, pair } );
			const cardDiffs = record.diffs.filter( ( diff ) => diff.field.startsWith( 'card.' ) );

			await testInfo.attach( 'parity.json', {
				body: JSON.stringify( { ...record, diffs: cardDiffs, counts: {} } ),
				contentType: 'application/json',
			} );

			test.skip( 200 !== record.liveStatus, `live answered ${ record.liveStatus } for ${ pair.path }` );

			for ( const diff of cardDiffs.filter( ( d ) => 'KNOWN_PENDING' === d.cls ) ) {
				testInfo.annotations.push( { type: 'known-pending', description: `${ diff.label }: ${ diff.detail }` } );
			}

			const missing = cardDiffs
				.filter( ( diff ) => 'MISSING_ON_DEV' === diff.cls )
				.map( ( diff ) => `${ diff.label }: ${ diff.detail }` );

			expect(
				missing,
				`${ pair.path }: card rows shown on live but not on dev:\n  ${ missing.join( '\n  ' ) }`
			).toEqual( [] );
		} );
	}
} );
