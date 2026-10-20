/**
 * Differences from live that are deliberate: the rebuild's design and
 * accessibility decisions.
 *
 * The rebuild is meant to look and work like live, so by default anything live
 * shows and dev does not is MISSING_ON_DEV and fails the parity run. When a
 * difference is a decision, not a bug, list it here: it moves to INTENTIONAL,
 * which does not fail and stays in the report with its reason.
 *
 * Each entry:
 *   field  RegExp tested against the diff's field path (`fact.<key>`, `map`,
 *          `map.places`, `chrome.menu.<label>`, `chrome.footer`, …).
 *   types  Optional: limit to page types (tour, destination, chrome, …).
 *   live   Optional: RegExp the live value must match, to allow one item, not
 *          the whole field.
 *   reason Why it is intentional: who decided, and when.
 *
 * Keep this short. An over-broad entry hides the next artefact.
 *
 * @package ATI_Theme_2026
 * @subpackage Tests
 */

const INTENTIONAL = [
	// Example:
	// { field: /^chrome\.footer$/, live: /^Sitemap$/, reason: 'Sitemap link dropped in the redesign (Zared, 2026-10-20)' },
];

/**
 * @param {string} type      Page type.
 * @param {string} field     Diff field path.
 * @param {string} liveValue The live value of the difference.
 * @return {string|null} The reason when the difference is intentional.
 */
function intentionalReason( type, field, liveValue = '' ) {
	const hit = INTENTIONAL.find(
		( entry ) =>
			entry.field.test( field ) &&
			( ! entry.types || entry.types.includes( type ) ) &&
			( ! entry.live || entry.live.test( String( liveValue ) ) )
	);

	return hit ? hit.reason : null;
}

module.exports = { INTENTIONAL, intentionalReason };
