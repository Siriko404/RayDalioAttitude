import { test, expect } from '@playwright/test';
test('dashboard page loads', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Dalio Dashboard/);
});
