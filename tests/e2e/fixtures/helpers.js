// Shared helpers for the ATI Theme 2026 e2e suite.

/**
 * Dismiss the CookieYes consent banner if it appears, so it doesn't
 * intercept clicks on underlying nav/form elements.
 */
async function acceptCookies(page) {
	const acceptButton = page.locator('#wt-cli-accept-all-btn');
	if (await acceptButton.isVisible({ timeout: 3000 }).catch(() => false)) {
		await acceptButton.click();
	}
}

/**
 * Collect same-origin href values from all <a> tags within a locator scope,
 * de-duplicated and filtered to real navigable links (no #anchors, mailto:, tel:, javascript:).
 */
async function collectInternalLinks(page, scopeSelector, baseURL) {
	const hrefs = await page.locator(`${scopeSelector} a[href]`).evaluateAll((links) =>
		links.map((a) => a.getAttribute('href'))
	);

	const origin = new URL(baseURL).origin;
	const seen = new Set();

	for (const href of hrefs) {
		if (!href) continue;
		if (href.startsWith('#')) continue;
		if (/^(mailto|tel|javascript):/i.test(href)) continue;

		let absolute;
		try {
			absolute = new URL(href, baseURL).toString();
		} catch {
			continue;
		}

		if (new URL(absolute).origin !== origin) continue; // external links checked separately if needed
		seen.add(absolute);
	}

	return Array.from(seen);
}

module.exports = { acceptCookies, collectInternalLinks };
