/**
 * Small shared helpers.
 *
 * @package ATI_Theme_2026
 * @subpackage Tests
 */

/**
 * Dismiss the CookieYes / Cookie Law Info consent banner if it is showing, so
 * it cannot intercept clicks on the header or a modal trigger. (Carried over
 * from the previous suite, which clicked `#wt-cli-accept-all-btn`.) Consent is
 * stored client-side only; nothing is sent to the site.
 *
 * @param {import('@playwright/test').Page} page Page under test.
 */
async function acceptCookies( page ) {
	const accept = page
		.locator(
			'#wt-cli-accept-all-btn, #cookie_action_close_header, .cky-btn-accept, .cli-bar-btn_container a.cli_action_button'
		)
		.first();

	if ( await accept.isVisible( { timeout: 1500 } ).catch( () => false ) ) {
		await accept.click( { timeout: 3000 } ).catch( () => {} );
	}
}

/**
 * Move the pointer to the bottom-left of the viewport, clear of the header.
 *
 * @param {import('@playwright/test').Page} page Page under test.
 */
async function parkPointer( page ) {
	const { height } = page.viewportSize() || { height: 600 };

	await page.mouse.move( 5, height - 5 );
}

/**
 * Normalise text for comparison.
 *
 * @param {string} text Raw text.
 * @return {string} Lower-case words.
 */
function words( text ) {
	return String( text || '' )
		.toLowerCase()
		.replace( /[^a-z0-9]+/g, ' ' )
		.trim();
}

/**
 * Request headers for GETs against the target.
 *
 * Dev sits behind a page cache (`x-cache-status: HIT`). By default the suite
 * reads through it: faster, and gentle on a host the client is reviewing. After
 * a deploy the cached HTML can be stale — set `ATI_BYPASS_CACHE=true` to send a
 * `comment_author_*` cookie (the cache's own excluded-cookie rule; inert to
 * everything else), which renders every page fresh. That is slower and costs
 * PHP time on dev, so it is opt-in.
 *
 * @return {Object<string, string>} Headers.
 */
function devHeaders() {
	return 'true' === process.env.ATI_BYPASS_CACHE
		? { Cookie: 'comment_author_ati_e2e=1' }
		: {};
}

module.exports = { acceptCookies, parkPointer, words, devHeaders };
