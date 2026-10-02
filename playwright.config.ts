import { defineConfig, devices } from '@playwright/test';

// Define environment endpoints (UI & API)
const environments = {
  dev: {
    ui: 'https://dev.example.com',
    api: 'https://api-dev.example.com',
  },
  qa: {
    ui: 'https://practicetestautomation.com',
    api: 'https://restful-booker.herokuapp.com',
  },
  preprod: {
    ui: 'https://preprod.example.com',
    api: 'https://api-preprod.example.com',
  },
  uat: {
    ui: 'https://uat.example.com',
    api: 'https://api-uat.example.com',
  },
};

const currentEnv = (process.env.TEST_ENV || 'qa') as keyof typeof environments;
const targetEnv = environments[currentEnv] || environments.qa;

export default defineConfig({
  timeout: 60000,
  expect: {
    timeout: 10000,
  },

  /* Run tests inside each file in parallel */
  fullyParallel: true,

  /* Prevent accidental test.only in CI builds */
  forbidOnly: !!process.env.CI,

  /* Retry on CI only to catch network flakes */
  retries: process.env.CI ? 2 : 2,

  /* CI uses 2 workers per runner; local machine uses system default */
  workers: process.env.CI ? 2 : undefined,

  /* 
   * Reporter:
   * - CI: 'list', 'blob' (for artifact merging), and 'json'
   * - Local: 'list', 'html' (open: 'never' prevents unwanted popups during AI runs), and 'json'
   */
  reporter: process.env.CI
    ? [
        ['list'],
        ['blob'],
        ['json', { outputFile: 'test-results/results.json' }],
      ]
    : [
        ['list'],
        ['html', { open: 'never' }],
        ['json', { outputFile: 'test-results/results.json' }],
      ],

  /* Shared settings across projects */
  use: {
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  /* Isolated Projects by Folder */
  projects: [
    // =========================================================================
    // 1. PURE API PROJECT (Browserless, Headless HTTP Client)
    // =========================================================================
    {
      name: 'api',
      testDir: './tests/api',
      use: {
        baseURL: targetEnv.api,
        extraHTTPHeaders: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      },
    },

    // =========================================================================
    // 2. UI BROWSER MATRIX (Runs tests/ui only)
    // =========================================================================
    {
      name: 'chromium',
      testDir: './tests/ui',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: targetEnv.ui,
      },
    },
    {
      name: 'firefox',
      testDir: './tests/ui',
      use: {
        ...devices['Desktop Firefox'],
        baseURL: targetEnv.ui,
      },
    },
    {
      name: 'webkit',
      testDir: './tests/ui',
      use: {
        ...devices['Desktop Safari'],
        baseURL: targetEnv.ui,
      },
    },
  ],
});