const { defineConfig, devices } = require('@playwright/test');

const baseURL = process.env.WP_BASE_URL || 'https://ati-holidays.lightspeedwp.dev';

module.exports = defineConfig({
	testDir: './specs',
	timeout: 60 * 1000,
	fullyParallel: true,
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 1 : 0,
	workers: process.env.CI ? 2 : undefined,

	reporter: [
		['html', { open: 'never' }],
		['list'],
	],

	use: {
		baseURL,
		trace: 'on-first-retry',
		screenshot: 'only-on-failure',
		video: 'retain-on-failure',
	},

	projects: [
		{
			name: 'desktop-chromium',
			use: { ...devices['Desktop Chrome'] },
		},
		{
			name: 'mobile-chromium',
			use: { ...devices['Pixel 7'] },
		},
	],
});
