import { test, expect } from '@playwright/test';
import { storyUrl, testUrl } from './PlayWrightUtils';

test.describe.configure({ mode: 'parallel' });

function smoke(story: string) {
  return testUrl(storyUrl(true, "react-virtual-scroll", "VirtualScroll", story));
}

test('Two Dimensions Loads', async ({ page }) => {
  await page.goto(smoke("TwoDimensions"));
  await expect(page.getByText('isScrolling')).toBeInViewport();
});

test('Vertical Loads', async ({ page }) => {
  await page.goto(smoke("Vertical"));
  await expect(page.getByText('isScrolling')).toBeInViewport();
});

test('Horizontal Loads', async ({ page }) => {
  await page.goto(smoke("Horizontal"));
  await expect(page.getByText('isScrolling')).toBeInViewport();
});
