import { test, expect } from '@playwright/test';

test('has title @sanity', async ({ page }) => {
  console.log('This is a sanity test');
  //await page.goto('https://playwright.dev/');
  //console.log('Page URL is: ' + page.url());
  // Expect a title "to contain" a substring.
  //await expect(page).toHaveTitle(/Playwright/);
});

test('get started link @regression', async ({ page }) => {
  console.log('Tis is a regression test');
  //await page.goto('https://playwright.dev/');
  ///console.log('Page URL is: ' + page.url());
  // Click the get started link.
  //await page.getByRole('link', { name: 'Get started123' }).click();
  // Expects page to have a heading with the name of Installation.
  //await expect(page.getByRole('heading', { name: 'Installation' })).toBeVisible();
});
