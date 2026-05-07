import { test, expect } from '@playwright/test';

test.describe('acceptance smoke', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('/api/fetch-all', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ fetched_at_utc: '2026-04-30T14:32:00Z', sources: { fred: {}, bis: {}, cofer: {}, wb_wdi: {}, damodaran: { histretSP: [] }, shiller: { ie_data: [] }, yardeni: null, nber: { recession_dates: [] }, nyfed: { recession_prob_12m: 0.18 } }, errors: [] })
      });
    });
  });

  test('welcome → T1 → dashboard renders 13 slides', async ({ page }) => {
    await page.goto('/');
    await page.locator('button.begin-btn').click();
    await page.locator('button.wizard-next').click();   // T1 defaults
    await page.locator('button.wizard-skip').click();    // T2/T3 skip
    await expect(page.locator('section[data-slide-id]')).toHaveCount(13);
  });

  test('chip strip fills as user scrolls past emitting slides', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.setItem('dalio_dashboard_wizard_v1', JSON.stringify({ home_currency: 'USD', focus_country: 'US', risk_profile: 'balanced', sigma_target: 0.10 })));
    await page.reload();
    await page.locator('section[data-slide-id="1.7"]').scrollIntoViewIfNeeded();
    const inflChip = page.locator('.chip[data-kind="inflation"]');
    await expect(inflChip).toHaveAttribute('data-filled', 'true');
  });

  test('nav cell click smooth-scrolls to target slide', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.setItem('dalio_dashboard_wizard_v1', JSON.stringify({ home_currency: 'USD', focus_country: 'US', risk_profile: 'balanced', sigma_target: 0.10 })));
    await page.reload();
    const navCell = page.locator('.nav-group[data-group-id="2.2"] .nav-cell').first();
    await navCell.click();
    await page.waitForTimeout(800);  // scroll animation
    const slide = page.locator('section[data-slide-id="2.2"]');
    expect(await slide.evaluate(el => el.getBoundingClientRect().top)).toBeLessThan(900);
  });

  test('mobile splash on width < 1024 portrait', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');
    await expect(page.locator('.mobile-splash')).toBeVisible();
    await expect(page.locator('a.email-link')).toBeVisible();
  });
});
