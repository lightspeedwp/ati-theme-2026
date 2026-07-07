const { test, expect } = require('@playwright/test');
const { acceptCookies, collectInternalLinks } = require('../fixtures/helpers');
const { pages, singles } = require('../fixtures/test-data');

const KEY_TEMPLATES = [
	['Home', pages.home],
	['Tours archive', pages.archiveTour],
	['Destinations archive', pages.archiveDestination],
	['Accommodation archive', pages.archiveAccommodation],
	['Single tour', singles.tour],
	['Single destination', singles.destination],
	['Single accommodation', singles.accommodation],
	['Contact', pages.contact],
	['Tour enquiry', pages.tourEnquiry],
];

for (const [label, path] of KEY_TEMPLATES) {
	test(`${label} (${path}) loads without error`, async ({ page }) => {
		const response = await page.goto(path);
		expect(response.ok(), `${path} responded ${response.status()}`).toBeTruthy();
		await acceptCookies(page);
		await expect(page.locator('body')).toBeVisible();
	});
}

test.describe('Header navigation', () => {
	test('primary nav links are present and resolve without error', async ({ page, baseURL, request }) => {
		await page.goto(pages.home);
		await acceptCookies(page);

		const header = page.locator('header, [class*="header"]').first();
		await expect(header).toBeVisible();

		const links = await collectInternalLinks(page, 'header, .wp-block-navigation', baseURL);
		expect(links.length, 'expected at least one internal nav link').toBeGreaterThan(0);

		const results = await Promise.all(
			links.map((url) =>
				request
					.get(url)
					.then((res) => ({ url, ok: res.ok() || res.status() === 401 || res.status() === 403, status: res.status() }))
					.catch((e) => ({ url, ok: false, status: `error: ${e.message}` }))
			)
		);
		const broken = results.filter((r) => !r.ok).map((r) => `${r.url} -> ${r.status}`);

		expect(broken, `broken header links found:\n${broken.join('\n')}`).toEqual([]);
	});

	test('mega menu markup is present in the header', async ({ page }) => {
		// On mobile viewports the desktop mega menu is intentionally hidden in favor
		// of the hamburger nav, so this only checks the markup exists, not visibility.
		await page.goto(pages.home);
		await acceptCookies(page);

		const megaMenu = page.locator('[class*="mega-menu"]');
		expect(await megaMenu.count()).toBeGreaterThan(0);
	});
});

test.describe('Footer navigation', () => {
	test('footer links are present and resolve without error', async ({ page, baseURL, request }) => {
		await page.goto(pages.home);
		await acceptCookies(page);

		const footer = page.locator('footer').first();
		await expect(footer).toBeVisible();

		const links = await collectInternalLinks(page, 'footer', baseURL);
		expect(links.length, 'expected at least one internal footer link').toBeGreaterThan(0);

		const results = await Promise.all(
			links.map((url) =>
				request
					.get(url)
					.then((res) => ({ url, ok: res.ok() || res.status() === 401 || res.status() === 403, status: res.status() }))
					.catch((e) => ({ url, ok: false, status: `error: ${e.message}` }))
			)
		);
		const broken = results.filter((r) => !r.ok).map((r) => `${r.url} -> ${r.status}`);

		expect(broken, `broken footer links found:\n${broken.join('\n')}`).toEqual([]);
	});
});

test.describe('Buttons render and are actionable', () => {
	test('homepage CTA buttons are visible and enabled', async ({ page }) => {
		await page.goto(pages.home);
		await acceptCookies(page);

		const buttons = page.locator('a.wp-block-button__link, button:visible');
		const count = await buttons.count();
		expect(count, 'expected at least one button/CTA on the homepage').toBeGreaterThan(0);

		const sample = Math.min(count, 15);
		for (let i = 0; i < sample; i++) {
			const btn = buttons.nth(i);
			if (await btn.isVisible()) {
				await expect(btn).toBeEnabled();
			}
		}
	});

	test('single-tour "Enquire" button opens the enquiry modal', async ({ page }) => {
		await page.goto(singles.tour);
		await acceptCookies(page);

		const enquireButton = page.locator('a[href*="modal-enquiry"]').first();
		await expect(enquireButton).toBeVisible();
		await enquireButton.click();

		const modal = page.locator('#to-modal-modal-enquiry, [id*="modal-enquiry"]').first();
		await expect(modal).toBeVisible({ timeout: 5000 });
	});
});
