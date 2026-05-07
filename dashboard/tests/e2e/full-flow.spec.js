import { test, expect } from '@playwright/test';

test('full flow: bootstrap → wizard skip → all 13 slides render → final recipe visible', async ({ page }) => {
  await page.route('/api/fetch-all', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        fetched_at_utc: '2026-04-30T14:32:00Z',
        sources: { fred: {}, bis: {}, cofer: {}, wb_wdi: {}, damodaran: { histretSP: [] }, shiller: { ie_data: [] }, yardeni: null, nber: { recession_dates: [] }, nyfed: { recession_prob_12m: 0.18 } },
        errors: []
      })
    });
  });
  await page.evaluate(() => localStorage.setItem('dalio_dashboard_wizard_v1', JSON.stringify({ home_currency: 'USD', focus_country: 'US', risk_profile: 'balanced', sigma_target: 0.10 }))).catch(() => {});
  await page.goto('/');
  await page.evaluate(() => localStorage.setItem('dalio_dashboard_wizard_v1', JSON.stringify({ home_currency: 'USD', focus_country: 'US', risk_profile: 'balanced', sigma_target: 0.10 })));
  await page.reload();
  // 11 numbered live slides + 2 sidebars = 13 total
  const slideCount = await page.locator('section[data-slide-id]').count();
  expect(slideCount).toBeGreaterThanOrEqual(13);
  // Final slide visible after scroll
  await page.locator('section[data-slide-id="final"]').scrollIntoViewIfNeeded();
  await expect(page.locator('.recipe-block')).toBeVisible();
});
