/**
 * Differences that are known, understood, and waiting on a deploy.
 *
 * A theme fix in the working tree reaches dev only after it is pushed, so until
 * then the parity run reports the matching difference as MISSING_ON_DEV. That is
 * accurate but not actionable; listing it here moves it to KNOWN_PENDING, which
 * does not fail the run, and keeps it visible in the report with its reason.
 *
 * Each entry: `field` is a RegExp tested against the diff's field path
 * (`fact.<key>`, `card.<type>.<key>`, `itinerary`, `units`, `gallery`, `map`,
 * `enquiry`, `body`, `related.<type>`); `types` optionally limits it to page
 * types. DELETE an entry when its fix has deployed and the difference is gone —
 * a stale entry hides a regression.
 *
 * @package ATI_Theme_2026
 * @subpackage Tests
 */

const KNOWN_PENDING = [
	{
		field: /^card\.accommodation\.(location|style)$/,
		reason:
			'Accommodation card: Location row added and the travel-style wrapper corrected (patterns/ati-accommodation-card.php, working tree).',
	},
	{
		field: /^fact\.validity$/,
		types: [ 'special' ],
		reason:
			'Special "Booking Validity": registered through the lsx_to_multi_field_wrappers filter (functions.php, working tree).',
	},
	{
		field: /^fact\.tagline$/,
		reason: 'Tagline bindings added (working tree).',
	},
	{
		field: /^body\.additional-info$/,
		reason:
			'Travel information: lsx-general-wrapper renamed to lsx-additional-info-wrapper (working tree).',
	},
];

/**
 * @param {string} type  Page type (tour, accommodation, …).
 * @param {string} field Diff field path.
 * @return {string|null} The reason when the difference is known-pending.
 */
function pendingReason( type, field ) {
	const hit = KNOWN_PENDING.find(
		( entry ) =>
			entry.field.test( field ) &&
			( ! entry.types || entry.types.includes( type ) )
	);

	return hit ? hit.reason : null;
}

module.exports = { KNOWN_PENDING, pendingReason };
