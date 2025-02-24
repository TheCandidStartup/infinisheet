import { test, expect } from '@playwright/test';
import { storyUrl, testUrl } from './PlayWrightUtils';

test.describe.configure({ mode: 'parallel' });

function smoke(story: string) {
  return testUrl(storyUrl(true, "react-virtual-scroll", "VirtualGrid", story));
}

test('Hundred Square Loads', async ({ page }) => {
  await page.goto(smoke("HundredSquare"));
  await expect(page.getByText('1:0')).toBeInViewport();
  await expect(page.getByText('6:5')).toBeInViewport();
});

test('Trillion Square', async ({ page }) => {
  await page.goto(smoke("TrillionSquare"));
  await expect(page.getByText('1:0')).toBeInViewport();
  await expect(page.getByText('6:3')).toBeInViewport();
});

test('Use Is Scrolling Loads', async ({ page }) => {
  await page.goto(smoke("UseIsScrolling"));
  await expect(page.getByText('1:0')).toBeInViewport();
  await expect(page.getByText('6:5')).toBeInViewport();
});
