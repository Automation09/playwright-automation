// mcp-server.ts
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';

const execAsync = promisify(exec);

// 1. Initialize the MCP Server
const server = new Server(
  {
    name: 'playwright-test-framework',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// 2. Define the Tools exposed to your AI Assistant
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'run_tests',
        description: 'Run Playwright tests locally by project (api, chromium, firefox, webkit) or specific test file path.',
        inputSchema: {
          type: 'object',
          properties: {
            project: {
              type: 'string',
              description: 'Target project name: "api", "chromium", "firefox", or "webkit"',
            },
            filePath: {
              type: 'string',
              description: 'Path to spec file, e.g. "tests/ui/Login.spec.ts" or "tests/api/simple-api.spec.ts"',
            },
            grep: {
              type: 'string',
              description: 'Filter tests by tag, e.g. "@sanity" or "@regression"',
            },
          },
        },
      },
      {
        name: 'read_test_data',
        description: 'Read the contents of a test data file from the data/ folder.',
        inputSchema: {
          type: 'object',
          properties: {
            fileName: {
              type: 'string',
              description: 'Name of the JSON file in data directory (e.g., "userdata.json")',
            },
          },
          required: ['fileName'],
        },
      },
      {
        name: 'list_page_objects',
        description: 'Lists all available Page Object files in the pages/ directory.',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
    ],
  };
});

// 3. Handle Tool Execution
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  // Handler: Run Playwright Tests
  if (name === 'run_tests') {
    const projectFlag = args?.project ? `--project=${args.project}` : '';
    const fileArg = args?.filePath ? args.filePath : '';
    const grepFlag = args?.grep ? `--grep "${args.grep}"` : '';

    const command = `npx playwright test ${fileArg} ${projectFlag} ${grepFlag} --reporter=list`;

    try {
      const { stdout, stderr } = await execAsync(command);
      return {
        content: [{ type: 'text', text: `Test Run Passed:\n${stdout}\n${stderr}` }],
      };
    } catch (error: any) {
      return {
        content: [
          {
            type: 'text',
            text: `Test Run Failed:\n${error.stdout || ''}\n${error.stderr || ''}\n${error.message}`,
          },
        ],
        isError: true,
      };
    }
  }

  // Handler: Read Test Data
  if (name === 'read_test_data') {
    const fileName = String(args?.fileName);
    const resolvedPath = path.resolve(process.cwd(), 'data', fileName);

    if (!fs.existsSync(resolvedPath)) {
      return {
        content: [{ type: 'text', text: `File not found: ${resolvedPath}` }],
        isError: true,
      };
    }

    const content = fs.readFileSync(resolvedPath, 'utf-8');
    return {
      content: [{ type: 'text', text: content }],
    };
  }

  // Handler: List Page Objects
  if (name === 'list_page_objects') {
    const pagesDir = path.resolve(process.cwd(), 'pages');
    if (!fs.existsSync(pagesDir)) {
      return {
        content: [{ type: 'text', text: 'No "pages/" directory found in root.' }],
      };
    }

    const files = fs.readdirSync(pagesDir).filter((f) => f.endsWith('.ts'));
    return {
      content: [{ type: 'text', text: `Page Objects:\n${files.join('\n')}` }],
    };
  }

  throw new Error(`Tool "${name}" is not implemented.`);
});

// 4. Connect over Standard I/O (stdio)
async function startServer() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

startServer().catch((err) => {
  console.error('Fatal error starting MCP Server:', err);
  process.exit(1);
});