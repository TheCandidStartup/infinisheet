import { test, expect } from '@playwright/test';

test.describe.configure({ mode: 'parallel' });

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test('Scroll to 5000', async ({ page }) => {
  const name = page.getByTitle('Name');
  await name.click();
  await name.fill('5000');
  await name.press('Enter');

  const row = page.locator('.VirtualSpreadsheet_Row__Selected');
  await expect(row).toHaveText('5000');
});