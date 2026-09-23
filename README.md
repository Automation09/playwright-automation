# Playwright Automation Practice

This is a practice project for learning browser automation with [Playwright](https://playwright.dev/) and TypeScript.

The tests demonstrate:

- Page Object Model classes for reusable page interactions
- Custom Playwright fixtures
- UI navigation and login validation
- Running tests across Chromium, Firefox, and WebKit
- HTML reports, screenshots, and traces for failed tests

The tests use the public [Practice Test Automation](https://practicetestautomation.com/) website.

## Prerequisites

- Node.js 18 or newer
- npm

## Installation

Clone the repository, move into the project directory, and install the dependencies:

```bash
npm install
npx playwright install
```

## Running the tests

Run the complete test suite in all configured browsers:

```bash
npx playwright test
```

Run tests in a specific browser:

```bash
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

Run tests with the browser visible:

```bash
npx playwright test --headed
```

Run a specific test file:

```bash
npx playwright test tests/Login.spec.ts
```

Open the most recent HTML report:

```bash
npx playwright show-report
```

## Project structure

```text
.
├── data/
│   └── userdata.json          Test data for the login scenario
├── fixtures/
│   └── test-base.ts           Custom Playwright fixtures
├── pages/
│   ├── HomePage.ts            Home page object
│   ├── LoginPage.ts           Login page object
│   └── PracticePage.ts        Practice page object
├── tests/
│   ├── Login.spec.ts          Practice Test Automation scenarios
│   └── example.spec.ts        Playwright example tests
├── playwright.config.ts       Playwright configuration
├── package.json               Project dependencies
└── tsconfig.json              TypeScript configuration
```

## Test credentials

The login test uses the demo credentials provided by Practice Test Automation:

```text
Username: student
Password: Password123
```

These values are stored in `data/userdata.json` for practice purposes only. Do not use real credentials in test data or commit secrets to the repository.

## Notes

- The tests require an internet connection because they interact with public websites.
- Test results and reports are generated locally and are excluded from version control.
- The target website may change, become unavailable, or behave differently over time, which can cause practice tests to fail.
