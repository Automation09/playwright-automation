import { test, expect } from '@playwright/test';

test('API test @api', async ({ request }) => {
  // Playwright automatically prepends the baseURL from playwright.config.ts
  const response = await request.get('/booking/2');

  console.log('Response status: ' + response.status());
  const responseBody = await response.json();
  console.log('Response body: ' + JSON.stringify(responseBody, null, 2));

  expect(response.status()).toBe(200);
});