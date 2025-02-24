import { test, expect } from '@playwright/test';
import { storyUrl, testUrl } from './PlayWrightUtils';

test.describe.configure({ mode: 'parallel' });

function smoke(story: string) {
  return testUrl(storyUrl(true, "react-virtual-scroll", "DisplayList", story));
}

test('Vertical Loads', async ({ page }) => {
  await page.goto(smoke("Vertical"));
  await expect(page.getByText('Header')).toBeInViewport();
  await expect(page.getByText('Item 6')).toBeInViewport();
});

test('Negative Offset Loads', async ({ page }) => {
  await page.goto(smoke("NegativeOffset"));
  await expect(page.getByText('Header')).toBeInViewport();
  await expect(page.getByText('Item 4')).toBeInViewport();
});

test('Positive Offset Loads', async ({ page }) => {
  await page.goto(smoke("PositiveOffset"));
  await expect(page.getByText('Item 94')).toBeInViewport();
  await expect(page.getByText('Item 99')).toBeInViewport();
});

