import { test, expect } from '@playwright/test';
import { storyUrl, testUrl } from './PlayWrightUtils';

test.describe.configure({ mode: 'parallel' });

function smoke(story: string) {
  return testUrl(storyUrl(true, "react-virtual-scroll", "AutoSizer", story));
}

test('Full Screen Loads', async ({ page }) => {
  await page.goto(smoke("FullScreen"));
  await expect(page.getByText('width')).toBeInViewport();
});

