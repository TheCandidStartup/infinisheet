import { test, expect } from '@playwright/test';
import { storyUrl, testUrl } from './PlayWrightUtils';

test.describe.configure({ mode: 'parallel' });

function smoke(story: string) {
  return testUrl(storyUrl(true, "react-virtual-scroll", "DisplayGrid", story));
}

test('Origin Loads', async ({ page }) => {
  await page.goto(smoke("Origin"));
  await expect(page.getByText('1:0')).toBeInViewport();
  await expect(page.getByText('6:5')).toBeInViewport();
});

test('Negative Offsets Loads', async ({ page }) => {
  await page.goto(smoke("NegativeOffsets"));
  await expect(page.getByText('1:0')).toBeInViewport();
  await expect(page.getByText('4:4')).toBeInViewport();
});

test('Positive Offsets Loads', async ({ page }) => {
  await page.goto(smoke("PositiveOffsets"));
  await expect(page.getByText('94:1')).toBeInViewport();
  await expect(page.getByText('99:6')).toBeInViewport();
});

