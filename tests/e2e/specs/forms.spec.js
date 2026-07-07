const { test, expect } = require('@playwright/test');
const { acceptCookies } = require('../fixtures/helpers');
const { pages, testIdentity } = require('../fixtures/test-data');

// These tests submit real data to live Gravity Forms on the dev site, using a
// clearly test-tagged identity (fixtures/test-data.js) so submissions are
// identifiable in email / CRM. Do not point WP_BASE_URL at production.

test.describe('Contact form (Gravity Forms #4)', () => {
	test('fields render with expected labels', async ({ page }) => {
		await page.goto(pages.contact);
		await acceptCookies(page);

		const form = page.locator('#gform_4');
		await expect(form).toBeVisible();
		await expect(form.locator('input[name="input_2.3"]')).toBeVisible(); // First name
		await expect(form.locator('input[name="input_2.6"]')).toBeVisible(); // Last name
		await expect(form.locator('input[name="input_3"]')).toBeVisible(); // Email
		await expect(form.locator('input[name="input_1"]')).toBeVisible(); // Phone
		await expect(form.locator('textarea[name="input_4"]')).toBeVisible(); // Message
		await expect(form.locator('#gform_submit_button_4')).toBeVisible();
	});

	test('submits successfully with test data', async ({ page }) => {
		await page.goto(pages.contact);
		await acceptCookies(page);

		const form = page.locator('#gform_4');
		await form.locator('input[name="input_2.3"]').fill(testIdentity.firstName);
		await form.locator('input[name="input_2.6"]').fill(testIdentity.lastName);
		await form.locator('input[name="input_3"]').fill(testIdentity.email);
		await form.locator('input[name="input_1"]').fill(testIdentity.phone);
		await form.locator('textarea[name="input_4"]').fill(testIdentity.message);

		await Promise.all([
			page.waitForLoadState('networkidle'),
			form.locator('#gform_submit_button_4').click(),
		]);

		const confirmation = page.locator('#gform_confirmation_message_4');
		await expect(confirmation).toBeVisible({ timeout: 15000 });
	});
});

test.describe('Tour enquiry form (Gravity Forms #5)', () => {
	test('fields render with expected labels', async ({ page }) => {
		await page.goto(pages.tourEnquiry);
		await acceptCookies(page);

		const form = page.locator('#gform_5');
		await expect(form).toBeVisible();
		await expect(form.locator('input[name="input_1.3"]')).toBeVisible(); // First name
		await expect(form.locator('input[name="input_12.6"]')).toBeVisible(); // Last name
		await expect(form.locator('input[name="input_3"]')).toBeVisible(); // Phone
		await expect(form.locator('input[name="input_4"]')).toBeVisible(); // Email
		await expect(form.locator('#input_5_5_1')).toBeVisible(); // Month
		await expect(form.locator('#input_5_5_2')).toBeVisible(); // Day
		await expect(form.locator('#input_5_5_3')).toBeVisible(); // Year
		await expect(form.locator('input[name="input_6"]')).toBeVisible(); // Adults
		await expect(form.locator('input[name="input_7"]')).toBeVisible(); // Children
		await expect(form.locator('#gform_submit_button_5')).toBeVisible();
	});

	test('submits successfully with test data', async ({ page }) => {
		await page.goto(pages.tourEnquiry);
		await acceptCookies(page);

		const form = page.locator('#gform_5');
		await form.locator('input[name="input_1.3"]').fill(testIdentity.firstName);
		await form.locator('input[name="input_12.6"]').fill(testIdentity.lastName);
		await form.locator('input[name="input_3"]').fill(testIdentity.phone);
		await form.locator('input[name="input_4"]').fill(testIdentity.email);
		await form.locator('#input_5_5_1').selectOption('6'); // Month
		await form.locator('#input_5_5_2').selectOption('15'); // Day
		await form.locator('#input_5_5_3').selectOption('2027'); // Year
		await form.locator('input[name="input_6"]').fill('2'); // Adults
		await form.locator('input[name="input_7"]').fill('0'); // Children
		await form.locator('textarea[name="input_8"]').fill(testIdentity.message);

		await Promise.all([
			page.waitForLoadState('networkidle'),
			form.locator('#gform_submit_button_5').click(),
		]);

		const confirmation = page.locator('#gform_confirmation_message_5');
		await expect(confirmation).toBeVisible({ timeout: 15000 });
	});
});

// Booking / checkout involve a real booking + payment gateway on the LSX Tour
// Operator flow, so these only verify the form renders — they never submit.
test.describe('Booking form (verify only, no submit)', () => {
	test('booking form page renders a form', async ({ page }) => {
		const response = await page.goto(pages.bookingForm);
		expect(response.ok()).toBeTruthy();
		await acceptCookies(page);

		const form = page.locator('#gform_1');
		await expect(form).toBeVisible();
	});
});

test.describe('Checkout (verify only, no submit)', () => {
	test('checkout page renders without error', async ({ page }) => {
		const response = await page.goto(pages.checkout);
		expect(response.ok()).toBeTruthy();
		await acceptCookies(page);
		await expect(page.locator('body')).toBeVisible();
	});
});
