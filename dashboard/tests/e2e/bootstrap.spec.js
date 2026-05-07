import { test, expect } from '@playwright/test';

test('bootstrap loads + chip strip + nav bar appear', async ({ page }) => {
  // Mock /api/fetch-all to avoid backend dep
  await page.route('/api/fetch-all', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        fetched_at_utc: '2026-05-06T00:00Z',
        sources: {},
        errors: []
      })
    });
  });
  await page.goto('/');
  await expect(page.locator('#app')).toBeVisible();
  await expect(page.locator('#chip-strip')).toBeAttached();
  await expect(page.locator('#nav-bar')).toBeAttached();
});
