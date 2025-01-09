import { test, expect } from '@playwright/test';

test.describe.configure({ mode: 'parallel' });

test('Control loads', async ({ page }) => {
  await page.goto('/iframe.html?id=react-virtual-scroll-virtuallist--default');
  const header = page.getByText('Header');
  await expect(header).toBeInViewport();
});