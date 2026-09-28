# Playwright Practice Automation Framework

This project is a Playwright + TypeScript test automation framework for practicing UI and API testing against the public [Practice Test Automation](https://practicetestautomation.com/) site.

## Framework and purpose

- Playwright for browser automation
- TypeScript for test logic and page objects
- Page Object Model (POM) for reusable UI interactions
- Custom fixtures for shared page objects
- API testing using Playwright's request context
- Regression and sanity tagging for test categorization

## Prerequisites

- Node.js 18 or newer
- npm

## Installation

```bash
npm install
npx playwright install
```

## Run the tests

Run all tests:

```bash
npx playwright test
```

Run a specific browser project:

```bash
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

Run tests in headed mode:

```bash
npx playwright test --headed
```

Run a single file:

```bash
npx playwright test tests/ui/Login.spec.ts
```

Run a single test by name:

```bash
npx playwright test -g "logs in successfully with valid credentials"
```

Show the HTML report:

```bash
npx playwright show-report
```

## Project structure

```text
.
├── data/
│   └── userdata.json              Test data for login scenarios
├── fixtures/
│   └── test-base.ts               Custom Playwright fixtures and page objects
├── pages/
│   ├── HomePage.ts                Home page actions
│   ├── LoginPage.ts               Login page interactions
│   └── PracticePage.ts            Practice page navigation helpers
├── tests/
│   ├── api/
│   │   └── simple-api.spec.ts     API validation test
│   └── ui/
│       ├── Login.spec.ts          Login UI workflow tests
│       ├── example.spec.ts        Example Playwright test cases
│       └── login-valid-credentials.spec.ts  Duplicate valid-login case removed from active suite
├── Dockerfile                     Container setup for the project
├── mcp-server.ts                 MCP server entry point
├── playwright.config.ts          Playwright configuration
├── package.json                  Project scripts and dependencies
├── tsconfig.json                 TypeScript configuration
├── README.md                     Project documentation
├── screenshots/                  Local screenshots
├── test-results/                 Playwright test output
├── playwright-report/            HTML test report
└── data/userdata.json            Login credentials used in tests
```

## Test credentials

The UI tests use the demo credentials for the public practice site:

```text
Username: student
Password: Password123
```

The credentials are stored in `data/userdata.json` for training and practice purposes only.

## Notes

- The tests communicate with a public external website, so internet access is required.
- Reports and test artifacts are generated locally in the project folder.
- The target website may change over time, so tests should be kept aligned with the current UI.
