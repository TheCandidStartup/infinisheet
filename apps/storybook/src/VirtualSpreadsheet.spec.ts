import { test, expect } from '@playwright/test';
import { storyUrl, testUrl } from './PlayWrightUtils';

test.describe.configure({ mode: 'parallel' });

function smoke(story: string) {
  return testUrl(storyUrl(true, "react-spreadsheet", "VirtualSpreadsheet", story));
}

test('Empty Loads', async ({ page }) => {
  await page.goto(smoke("Empty"));
  await expect(page.getByText('A', { exact: true })).toBeInViewport();
  await expect(page.getByText('F', { exact: true })).toBeInViewport();
  await expect(page.getByText('1', { exact: true })).toBeInViewport();
  await expect(page.getByText('10', { exact: true })).toBeInViewport();
});

test('Boring Data Loads', async ({ page }) => {
  await page.goto(smoke("BoringData"));
  await expect(page.getByText('Date', { exact: true })).toBeInViewport();
  await expect(page.getByText('Quantity', { exact: true })).toBeInViewport();
});

test('Test Data Loads', async ({ page }) => {
  await page.goto(smoke("TestData"));
  await expect(page.getByText('1899-12-20', { exact: true })).toBeInViewport();
  await expect(page.getByText('A10', { exact: true })).toBeInViewport();
});

test('Cell Names Loads', async ({ page }) => {
  await page.goto(smoke("CellNames"));
  await expect(page.getByText('A1', { exact: true })).toBeInViewport();
  await expect(page.getByText('D10', { exact: true })).toBeInViewport();
});

test('Read Only Loads', async ({ page }) => {
  await page.goto(smoke("ReadOnly"));
  await expect(page.getByText('1899-12-20', { exact: true })).toBeInViewport();
  await expect(page.getByText('A10', { exact: true })).toBeInViewport();
});

test('RowSelected Loads', async ({ page }) => {
  await page.goto(smoke("RowSelected"));
  await expect(page.getByText('A3', { exact: true })).toBeInViewport();
  const row = page.locator('.VirtualSpreadsheet_Row__Selected');
  await expect(row).toHaveText("3");
  await expect(page.getByTitle("Name")).toHaveValue("3");
  await expect(page.getByTitle("Formula")).toHaveValue("A3");
});

test('ColumnSelected Loads', async ({ page }) => {
  await page.goto(smoke("ColumnSelected"));
  await expect(page.getByText('A3', { exact: true })).toBeInViewport();
  const col = page.locator('.VirtualSpreadsheet_Column__Selected');
  await expect(col).toHaveText("C");
  await expect(page.getByTitle("Name")).toHaveValue("C");
  await expect(page.getByTitle("Formula")).toHaveValue("1899-12-20");
});

test('CellSelected Loads', async ({ page }) => {
  await page.goto(smoke("CellSelected"));
  await expect(page.getByText('A3', { exact: true })).toBeInViewport();
  const cell = page.locator('div.VirtualSpreadsheet_Cell__Focus');
  await expect(cell).toHaveText("1899-12-22");
  await expect(page.getByTitle("Name")).toHaveValue("C3");
  await expect(page.getByTitle("Formula")).toHaveValue("1899-12-22");
});

test('Full Width Loads', async ({ page }) => {
  await page.goto(smoke("FullWidth"));
  await expect(page.getByText('1899-12-20', { exact: true })).toBeInViewport();
  await expect(page.getByText('H1', { exact: true })).toBeInViewport();
  await expect(page.getByText('A14', { exact: true })).toBeInViewport();
});

test('Full Screen Loads', async ({ page }) => {
  await page.goto(smoke("FullScreen"));
  await expect(page.getByText('1899-12-20', { exact: true })).toBeInViewport();
  await expect(page.getByText('H1', { exact: true })).toBeInViewport();
  await expect(page.getByText('A20', { exact: true })).toBeInViewport();
});

test('Event Source Sync Loads', async ({ page }) => {
  await page.goto(smoke("EventSourceSync"));
  const cols = page.getByText('A', { exact: true });
  const rows = page.getByText('1', { exact: true });
  await expect(cols).toHaveCount(2);
  await expect(cols.first()).toBeInViewport();
  await expect(cols.nth(1)).toBeInViewport();
  await expect(rows).toHaveCount(2);
  await expect(rows.first()).toBeInViewport();
  await expect(rows.nth(1)).toBeInViewport();
  
  await expect(page.getByText('Loading ...')).toHaveCount(0);
});