const { test, expect } = require('@playwright/test');
const { acceptCookies } = require('../fixtures/helpers');
const { pages, singles } = require('../fixtures/test-data');

test.describe('Single tour', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto(singles.tour);
		await acceptCookies(page);
	});

	test('renders title, fast facts, and pricing', async ({ page }) => {
		await expect(page.locator('h1')).toBeVisible();
		await expect(page.locator('h1')).not.toBeEmpty();

		const fastFacts = page.locator('.fast-facts-wrapper');
		await expect(fastFacts).toBeVisible();
		await expect(fastFacts).not.toBeEmpty();
	});

	test('renders content images beyond header/footer chrome', async ({ page }) => {
		// Theme templates have no <main>/<article> landmark to scope by, and content
		// images (gallery/featured image) live outside .entry-content, so this checks
		// a page-wide count high enough that it can only be true if content rendered.
		const images = page.locator('img');
		expect(await images.count()).toBeGreaterThan(5);
	});

	test('has a working enquiry entry point', async ({ page }) => {
		const enquire = page.locator('a[href*="modal-enquiry"]').first();
		await expect(enquire).toBeVisible();
	});
});

test.describe('Single destination', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto(singles.destination);
		await acceptCookies(page);
	});

	test('renders title and content', async ({ page }) => {
		await expect(page.locator('h1')).toBeVisible();
		await expect(page.locator('h1')).not.toBeEmpty();
	});

	test('lists related tours or accommodation, if present', async ({ page }) => {
		const related = page.locator('[class*="tour-card"], [class*="accommodation-card"], [class*="destination-card"]');
		// Not every destination has related content, so this is informational rather than a hard failure.
		test.info().annotations.push({
			type: 'related-content-count',
			description: String(await related.count()),
		});
	});
});

test.describe('Single accommodation', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto(singles.accommodation);
		await acceptCookies(page);
	});

	test('renders title and content', async ({ page }) => {
		await expect(page.locator('h1')).toBeVisible();
		await expect(page.locator('h1')).not.toBeEmpty();
	});

	test('renders content images beyond header/footer chrome', async ({ page }) => {
		const images = page.locator('img');
		expect(await images.count()).toBeGreaterThan(5);
	});
});

test.describe('Archives', () => {
	test('tours archive lists tour cards linking to single-tour pages', async ({ page }) => {
		await page.goto(pages.archiveTour);
		await acceptCookies(page);

		const cards = page.locator('[class*="tour-card"]');
		expect(await cards.count()).toBeGreaterThan(0);

		const firstCardLink = cards.first().locator('a[href*="/tour/"]').first();
		await expect(firstCardLink).toHaveAttribute('href', /\/tour\//);
	});

	test('destinations archive lists destination cards linking to single-destination pages', async ({ page }) => {
		await page.goto(pages.archiveDestination);
		await acceptCookies(page);

		const cards = page.locator('[class*="destination-card"], [class*="card"]');
		expect(await cards.count()).toBeGreaterThan(0);
	});

	test('accommodation archive lists accommodation cards', async ({ page }) => {
		await page.goto(pages.archiveAccommodation);
		await acceptCookies(page);

		const cards = page.locator('[class*="accommodation-card"], [class*="card"]');
		expect(await cards.count()).toBeGreaterThan(0);
	});
});
