import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import * as fs from 'node:fs';
import * as path from 'node:path';
import process from 'node:process';

const execAsync = promisify(exec);

const server = new Server(
  {
    name: 'playwright-framework',
    version: '1.1.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// 1. Tool Definitions
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'run_tests',
        description: 'Run Playwright tests by project or specific test file path.',
        inputSchema: {
          type: 'object',
          properties: {
            project: { type: 'string', description: 'e.g. "api", "chromium"' },
            filePath: { type: 'string', description: 'e.g. "tests/ui/login-valid-credentials.spec.ts"' },
            grep: { type: 'string', description: 'Tag or keyword filter, e.g. "@smoke"' },
          },
        },
      },
      {
        name: 'get_test_summary',
        description: 'Parses test-results/results.json and extracts total passes, failures, and detailed error messages.',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'read_test_data',
        description: 'Read JSON test data from the data/ directory.',
        inputSchema: {
          type: 'object',
          properties: {
            fileName: { type: 'string', description: 'e.g. "userdata.json"' },
          },
          required: ['fileName'],
        },
      },
      {
        name: 'list_page_objects',
        description: 'Lists all available Page Object files in the pages/ folder.',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'read_page_object',
        description: 'Read the TypeScript source code of a specific Page Object file.',
        inputSchema: {
          type: 'object',
          properties: {
            pageName: { type: 'string', description: 'e.g. "LoginPage.ts"' },
          },
          required: ['pageName'],
        },
      },
    ],
  };
});

// 2. Tool Execution Logic
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  // Handler: Run Playwright Tests
  if (name === 'run_tests') {
    const projectFlag = args?.project ? `--project=${args.project}` : '';
    const fileArg = args?.filePath ? String(args.filePath) : '';
    const grepFlag = args?.grep ? `--grep "${args.grep}"` : '';

    const command = `npx playwright test ${fileArg} ${projectFlag} ${grepFlag}`;

    try {
      const { stdout, stderr } = await execAsync(command);
      return {
        content: [{ type: 'text', text: `Tests Finished Successfully:\n${stdout}\n${stderr}` }],
      };
    } catch (error: any) {
      return {
        content: [
          {
            type: 'text',
            text: `Tests Failed. Use 'get_test_summary' for root-cause details.\n\n${error.stdout || error.message}`,
          },
        ],
        isError: true,
      };
    }
  }

  // Handler: Parse Test Results JSON
  if (name === 'get_test_summary') {
    const reportPath = path.resolve(process.cwd(), 'test-results', 'results.json');
    if (!fs.existsSync(reportPath)) {
      return {
        content: [{ type: 'text', text: 'No test-results/results.json found. Run tests first.' }],
        isError: true,
      };
    }

    try {
      const raw = fs.readFileSync(reportPath, 'utf-8');
      const data = JSON.parse(raw);

      const failures: Array<{ title: string; file: string; message: string }> = [];
      let totalPassed = 0;
      let totalFailed = 0;

      const scanSuites = (suites: any[]) => {
        for (const suite of suites) {
          if (suite.specs) {
            for (const spec of suite.specs) {
              for (const test of spec.tests) {
                for (const result of test.results) {
                  if (result.status === 'passed') totalPassed++;
                  if (result.status === 'failed' || result.status === 'timedOut') {
                    totalFailed++;
                    failures.push({
                      title: spec.title,
                      file: spec.file,
                      message: result.error?.message || 'Unknown error',
                    });
                  }
                }
              }
            }
          }
          if (suite.suites) scanSuites(suite.suites);
        }
      };

      if (data.suites) scanSuites(data.suites);

      const summary = {
        totalPassed,
        totalFailed,
        durationMs: data.stats?.duration || 0,
        failures,
      };

      return {
        content: [{ type: 'text', text: JSON.stringify(summary, null, 2) }],
      };
    } catch (err: any) {
      return {
        content: [{ type: 'text', text: `Failed to parse results.json: ${err.message}` }],
        isError: true,
      };
    }
  }

  // Handler: Read Test Data
  if (name === 'read_test_data') {
    const filePath = path.resolve(process.cwd(), 'data', String(args?.fileName));
    if (!fs.existsSync(filePath)) {
      return { content: [{ type: 'text', text: `File not found: ${filePath}` }], isError: true };
    }
    return { content: [{ type: 'text', text: fs.readFileSync(filePath, 'utf-8') }] };
  }

  // Handler: List Page Objects
  if (name === 'list_page_objects') {
    const pagesDir = path.resolve(process.cwd(), 'pages');
    if (!fs.existsSync(pagesDir)) {
      return { content: [{ type: 'text', text: 'Directory "pages/" does not exist.' }] };
    }
    const files = fs.readdirSync(pagesDir).filter((f: string) => f.endsWith('.ts'));
    return { content: [{ type: 'text', text: JSON.stringify(files) }] };
  }

  // Handler: Read Single Page Object
  if (name === 'read_page_object') {
    const pageFile = path.resolve(process.cwd(), 'pages', String(args?.pageName));
    if (!fs.existsSync(pageFile)) {
      return { content: [{ type: 'text', text: `Page Object "${args?.pageName}" not found.` }], isError: true };
    }
    return { content: [{ type: 'text', text: fs.readFileSync(pageFile, 'utf-8') }] };
  }

  throw new Error(`Unknown tool: ${name}`);
});

async function startServer() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

startServer().catch((err) => {
  console.error('Fatal MCP Server error:', err);
  process.exit(1);
});