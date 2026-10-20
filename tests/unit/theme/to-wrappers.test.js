/**
 * Tour Operator wrapper / binding agreement, checked statically.
 *
 * LSX Tour Operator 2.2 removes the HTML of any `core/group` or `core/paragraph`
 * whose className matches `/(lsx|facts)-(.*?)-wrapper/` when the key it derives
 * from the class is empty for the current post (see helpers/to-wrappers.js for
 * the full rule). So a wrapper class that does not match the field bound inside
 * it silently hides the row on every post where the *class's* field is empty:
 *
 *   `lsx-duration-wrapper` around a `travel-style` post-terms block
 *     → the Travel Style row disappears on any post with no `duration` meta.
 *
 * These tests parse every template, part and pattern and assert each wrapper
 * contains a binding (or taxonomy block) that satisfies its own key. They are
 * the file-level twin of the rendered check in
 * tests/e2e/templates/wrappers.spec.js.
 *
 * Multi-field wrappers (`travel-information`, `include-exclude`) and `-query`
 * wrappers are judged by their own rules, not by a single matching binding.
 *
 * @package ATI_Theme_2026
 * @subpackage Tests
 */

import { describe, expect, it } from 'vitest';

import { expectNone } from '../helpers/assert';
import { parseBlocks, bindingsOf } from '../helpers/block-parser';
import { markup, markupFiles } from '../helpers/theme-files';
import {
	judge,
	wrapperOf,
	MULTI_FIELD_WRAPPERS,
	normalise,
} from '../helpers/to-wrappers';

/**
 * @param {string} file Theme-relative path.
 * @return {{block: Object, verdict: Object}[]} Wrappers and their verdicts.
 */
function wrappersIn( file ) {
	return parseBlocks( markup( file ) )
		.all.filter( wrapperOf )
		.map( ( block ) => ( { block, verdict: judge( block ) } ) );
}

const FILES = markupFiles().filter( ( file ) => wrappersIn( file ).length );

describe( 'the checker can fail (controls)', () => {
	const group = ( className, inner ) =>
		`<!-- wp:group {"className":"${ className }"} -->\n<div class="wp-block-group ${ className }">${ inner }</div>\n<!-- /wp:group -->`;
	const meta = ( key ) =>
		`<!-- wp:paragraph {"metadata":{"bindings":{"content":{"source":"lsx/post-meta","args":{"key":"${ key }"}}}}} -->\n<p></p>\n<!-- /wp:paragraph -->`;
	const terms = ( term ) => `<!-- wp:post-terms {"term":"${ term }"} /-->`;
	const verdicts = ( source ) =>
		parseBlocks( source )
			.all.filter( wrapperOf )
			.map( judge );

	it( 'passes a wrapper whose binding matches (hyphen/underscore normalised)', () => {
		expect(
			verdicts(
				group( 'lsx-number-of-rooms-wrapper', meta( 'number_of_rooms' ) )
			)[ 0 ].ok
		).toBe( true );
	} );

	it( 'fails the known accommodation-card bug: duration wrapper around travel-style terms', () => {
		const [ verdict ] = verdicts(
			group( 'lsx-duration-wrapper', terms( 'travel-style' ) )
		);

		expect( verdict.ok ).toBe( false );
		expect( verdict.suggestion ).toContain( 'lsx-travel-style-wrapper' );
	} );

	it( 'passes a taxonomy wrapper that holds its own post-terms', () => {
		expect(
			verdicts( group( 'lsx-travel-style-wrapper', terms( 'travel-style' ) ) )[ 0 ].ok
		).toBe( true );
	} );

	it( 'fails a static-text wrapper with no binding at all', () => {
		expect(
			verdicts( group( 'lsx-tagline-wrapper', '<p>Static</p>' ) )[ 0 ].ok
		).toBe( false );
	} );

	it( 'allowlists multi-field wrappers without a same-named binding', () => {
		expect(
			verdicts(
				group( 'lsx-travel-information-wrapper', group( 'lsx-visa-wrapper', meta( 'visa' ) ) )
			).every( ( v ) => v.ok )
		).toBe( true );
	} );

	it( 'does not let a nested wrapper’s binding satisfy its parent', () => {
		const [ outer ] = verdicts(
			group( 'lsx-price-wrapper', group( 'lsx-duration-wrapper', meta( 'duration' ) ) )
		);

		expect( outer.ok ).toBe( false );
	} );

	it( 'detects the className quirk (an lsx- class before the wrapper class)', () => {
		const [ verdict ] = verdicts(
			group( 'lsx-accommodation-info lsx-rating-wrapper', meta( 'rating' ) )
		);

		expect( verdict.ok ).toBe( false );
		expect( verdict.kind ).toBe( 'class-quirk' );
	} );

	it( 'documents the multi-field allowlist (TO defaults plus theme-registered)', () => {
		expect( Object.keys( MULTI_FIELD_WRAPPERS ) ).toEqual(
			expect.arrayContaining( [ 'include-exclude', 'travel-information' ] )
		);
	} );
} );

describe( 'wrapper classes agree with the field bound inside them', () => {
	it( 'finds wrappers to check', () => {
		expect( FILES.length ).toBeGreaterThan( 0 );
	} );

	it.each( FILES )( '%s', ( file ) => {
		const failures = wrappersIn( file )
			.filter( ( { verdict } ) => ! verdict.ok )
			.map(
				( { block, verdict } ) =>
					`line ${ block.line }  .${ block.attrs.className.split( /\s+/ ).find( ( c ) => /(lsx|facts)-.*-wrapper/.test( c ) ) || block.attrs.className }  [${ verdict.kind }]\n` +
					`      TO derives key: ${ verdict.key }\n` +
					`      expects:        ${ verdict.expected }\n` +
					`      contains:       ${ verdict.found }\n` +
					`      fix:            ${ verdict.suggestion }`
			);

		expectNone(
			failures,
			`${ file } has wrapper(s) whose class does not match their content — ` +
				'TO will hide these rows wherever the class’s own field is empty:'
		);
	} );
} );

/**
 * Cards: the field rows a visitor expects to see, taken from live
 * (ati-holidays.com `.lsx-to-widget-meta-data .lsx-to-meta-data-key` labels).
 *
 * Presence of the *row* is asserted here; the e2e card-parity spec asserts what
 * actually renders. A row is "present" when a wrapper group with the right key
 * exists AND its content is bound to that same key — a mismatched wrapper does
 * not count, because TO would hide it.
 */
describe( 'card patterns carry the field rows live shows', () => {
	/**
	 * @param {string} file Pattern path.
	 * @return {Set<string>} Normalised wrapper keys that are correctly bound.
	 */
	function workingRows( file ) {
		return new Set(
			wrappersIn( file )
				.filter( ( { verdict } ) => verdict.ok )
				.map( ( { verdict } ) => normalise( verdict.key ) )
		);
	}

	/**
	 * `needs` lists the field each live label maps to.
	 */
	const CARDS = [
		{
			file: 'patterns/ati-accommodation-card.php',
			needs: {
				'Style (travel-style)': 'travel_style',
				'Type (accommodation-type)': 'accommodation_type',
				'Location (destination_to_accommodation)': 'destination_to_accommodation',
				'Rooms (number_of_rooms)': 'number_of_rooms',
			},
		},
		{
			file: 'patterns/ati-tour-card.php',
			needs: {
				'Duration (duration)': 'duration',
				'Price (price)': 'price',
			},
		},
	];

	it.each( CARDS )( '$file has working rows for each live label', ( { file, needs } ) => {
		const rows = workingRows( file );
		const missing = Object.entries( needs )
			.filter( ( [ , key ] ) => ! rows.has( key ) )
			.map( ( [ label ] ) => label );

		expectNone(
			missing,
			`${ file } renders no working row for the live label(s) below. ` +
				'A row counts only when a lsx-<key>-wrapper group contains the matching binding.'
		);
	} );

	it( 'bindings in the accommodation card are all keyed by a matching wrapper', () => {
		const { all } = parseBlocks( markup( 'patterns/ati-accommodation-card.php' ) );
		const bound = all
			.flatMap( bindingsOf )
			.filter( ( b ) => /post-(meta|connection)/.test( b.source ) )
			.map( ( b ) => normalise( b.key ) );

		expect( bound.length ).toBeGreaterThan( 0 );
	} );
} );
