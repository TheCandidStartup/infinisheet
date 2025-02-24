import { test, expect } from '@playwright/test';
import { storyUrl, testUrl } from './PlayWrightUtils';

test.describe.configure({ mode: 'parallel' });

function smoke(story: string) {
  return testUrl(storyUrl(true, "react-virtual-scroll", "VirtualList", story));
}

test('Vertical Loads', async ({ page }) => {
  await page.goto(smoke("Vertical"));
  await expect(page.getByText('Header')).toBeInViewport();
  await expect(page.getByText('Item 8')).toBeInViewport();
});

test('Horizontal Loads', async ({ page }) => {
  await page.goto(smoke("Horizontal"));
  await expect(page.getByText('Header')).toBeInViewport();
  await expect(page.getByText('Item 5')).toBeInViewport();
});

test('Trillion Rows Loads', async ({ page }) => {
  await page.goto(smoke("Trillion Rows"));
  await expect(page.getByText('Header')).toBeInViewport();
  await expect(page.getByText('Item 6')).toBeInViewport();
});

test('Use Is Scrolling Loads', async ({ page }) => {
  await page.goto(smoke("UseIsScrolling"));
  await expect(page.getByText('Header')).toBeInViewport();
  await expect(page.getByText('Item 6')).toBeInViewport();
});
