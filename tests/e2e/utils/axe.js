/**
 * Accessibility scanning (axe-core via @axe-core/playwright).
 *
 * Not a certified audit: an automated regression net for the mechanical
 * failures (contrast, names, roles, landmarks, labels) — roughly a third of
 * WCAG. A clean run means "nothing obviously broken", not "accessible".
 *
 * The gate is a baseline comparison (the org rule: no *new* violations against
 * a recorded baseline, not zero outright, or it fails on day one and is
 * switched off). With NO baseline file the scans report and do not fail; the
 * summary is also attached to the test as annotations so it shows in reports.
 * `npm run test:a11y:baseline` records one — do that only after the known
 * failures are fixed, or it bakes them in.
 *
 * @package ATI_Theme_2026
 * @subpackage Tests
 */

const fs = require( 'fs' );
const path = require( 'path' );
const AxeBuilder = require( '@axe-core/playwright' ).default;
const { expect } = require( '@playwright/test' );

/** WCAG 2.2 AA (a superset of 2.1 AA). */
const WCAG_TAGS = [ 'wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa' ];

const BASELINE_PATH = path.join( __dirname, '..', 'a11y', 'a11y-baseline.json' );
const UPDATE_BASELINE = 'true' === process.env.ATI_UPDATE_A11Y_BASELINE;

/**
 * Third-party markup we do not own; excluded from scans so a permanent known
 * failure does not train people to ignore the report. Nothing the theme or
 * Tour Operator renders belongs here.
 */
const A11Y_EXCLUDES = [
	'iframe[src*="google.com/maps"]',
	'iframe[src*="youtube"]',
	'.envira-gallery-wrap',
	'#cookie-law-info-bar',
	'.cky-consent-container',
];

/**
 * @param {import('@playwright/test').Page} page    Page under test.
 * @param {Object}                          options Options.
 * @param {string[]}                        options.disableRules Rules to skip (justify in the spec).
 * @return {Promise<Object>} Axe results.
 */
async function scan( page, { disableRules = [] } = {} ) {
	let builder = new AxeBuilder( { page } ).withTags( WCAG_TAGS );

	for ( const selector of A11Y_EXCLUDES ) {
		builder = builder.exclude( selector );
	}

	if ( disableRules.length ) {
		builder = builder.disableRules( disableRules );
	}

	return builder.analyze();
}

/**
 * @param {Object[]} violations Axe violations.
 * @return {string} Readable list: rule, impact, help URL and offending markup.
 */
function formatViolations( violations ) {
	return violations
		.map( ( v ) => {
			const nodes = v.nodes.slice( 0, 3 ).map( ( n ) => `      ${ n.html.slice( 0, 160 ) }` ).join( '\n' );

			return `  [${ v.impact }] ${ v.id } — ${ v.help } (${ v.nodes.length } node(s))\n    ${ v.helpUrl }\n${ nodes }`;
		} )
		.join( '\n\n' );
}

/**
 * @return {Object} Recorded baseline keyed by route.
 */
function readBaseline() {
	try {
		return JSON.parse( fs.readFileSync( BASELINE_PATH, 'utf8' ) );
	} catch {
		return {};
	}
}

/**
 * @return {boolean} Whether a baseline exists.
 */
function hasBaseline() {
	return fs.existsSync( BASELINE_PATH );
}

/**
 * @param {Object[]} violations Axe violations.
 * @return {Object<string, number>} Rule id → node count.
 */
function summarise( violations ) {
	return Object.fromEntries( violations.map( ( v ) => [ v.id, v.nodes.length ] ) );
}

/**
 * Gate on the baseline once one exists; until then, report.
 *
 * @param {Object}                              results  Axe results.
 * @param {string}                              route    Baseline key.
 * @param {string}                              label    For messages.
 * @param {import('@playwright/test').TestInfo} testInfo Current test.
 */
function check( results, route, label, testInfo ) {
	const current = summarise( results.violations );

	for ( const [ rule, count ] of Object.entries( current ) ) {
		testInfo.annotations.push( { type: 'axe', description: `${ rule }: ${ count } node(s)` } );
	}

	if ( UPDATE_BASELINE ) {
		const baseline = readBaseline();

		baseline[ route ] = current;
		fs.writeFileSync(
			BASELINE_PATH,
			JSON.stringify( Object.fromEntries( Object.keys( baseline ).sort().map( ( k ) => [ k, baseline[ k ] ] ) ), null, '\t' ) + '\n'
		);

		return;
	}

	if ( ! hasBaseline() ) {
		if ( results.violations.length ) {
			process.stderr.write(
				`\n  ⏸  ${ label }: ${ results.violations.length } violation(s), NOT failing — no baseline recorded.\n${ formatViolations( results.violations ) }\n`
			);
		}

		return;
	}

	const recorded = readBaseline()[ route ] || {};
	const regressions = Object.entries( current )
		.filter( ( [ rule, count ] ) => count > ( recorded[ rule ] || 0 ) )
		.map( ( [ rule, count ] ) => `${ rule }: ${ recorded[ rule ] || 0 } → ${ count } node(s)` );

	expect(
		regressions,
		`New accessibility violations on ${ label }:\n  ${ regressions.join( '\n  ' ) }\n\n` +
			formatViolations( results.violations.filter( ( v ) => regressions.some( ( r ) => r.startsWith( `${ v.id }:` ) ) ) ) +
			'\n\nFix the violation — do not widen the baseline to make this pass.'
	).toEqual( [] );
}

module.exports = { scan, check, formatViolations, summarise, hasBaseline, WCAG_TAGS };
