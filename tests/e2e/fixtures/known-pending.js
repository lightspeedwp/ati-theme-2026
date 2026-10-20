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
	// Empty: every fix listed here on 2026-10-16 deployed with e80c7be.
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
