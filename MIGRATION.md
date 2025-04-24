# Migration from FastMCP to Official MCP TypeScript SDK

This document outlines the migration of TaskFlow Memory Server from the third-party FastMCP framework to the official Model Context Protocol (MCP) TypeScript SDK.

## Overview

TaskFlow Memory Server has been migrated from the FastMCP framework to the official MCP TypeScript SDK to ensure better compatibility, maintenance, and features. This migration involves changes to dependencies, core architecture, and tool implementation patterns.

## Migration Steps

### 1. Dependencies Update

**Previous Dependencies:**
```json
"dependencies": {
  "dotenv": "^16.3.1",
  "fastmcp": "^0.5.0",
  "fs-extra": "^11.1.1",
  "lru-cache": "^10.0.1",
  "uuid": "^9.0.0",
  "winston": "^3.11.0"
}
```

**Updated Dependencies:**
```json
"dependencies": {
  "dotenv": "^16.3.1",
  "fs-extra": "^11.1.1",
  "lru-cache": "^10.0.1",
  "uuid": "^9.0.0",
  "winston": "^3.11.0",
  "@modelcontextprotocol/sdk": "^1.0.0",
  "zod": "^3.22.4"
},
"devDependencies": {
  "jest": "^29.5.0",
  "nodemon": "^3.0.1",
  "typescript": "^5.3.3",
  "@types/node": "^20.10.0"
}
```

### 2. Server Initialization Changes

**Before (using FastMCP):**
```javascript
import { FastMCP } from 'fastmcp';

// ...

this.server = new FastMCP(this.options);
```

**After (using MCP SDK):**
```javascript
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

// ...

this.server = new McpServer(
  { name: 'TaskFlow Memory Server', version },
  { capabilities: { tools: {}, resources: {} } }
);
```

### 3. Transport Changes

**Before (using FastMCP):**
```javascript
// Configure server startup options
const startOptions = {
  timeout: 120000 // 2 minutes timeout
};

// If port is specified, use HTTP transport, otherwise use stdio
if (options.port) {
  startOptions.transportType = 'http';
  startOptions.port = options.port;
} else {
  startOptions.transportType = 'stdio';
}

// Start the FastMCP server
await this.server.start(startOptions);
```

**After (using MCP SDK):**
```javascript
// If port is specified, use HTTP transport, otherwise use stdio
if (options.port) {
  const httpTransport = new HttpServerTransport({ port: options.port });
  await this.server.connect(httpTransport);
} else {
  const stdioTransport = new StdioServerTransport();
  await this.server.connect(stdioTransport);
}
```

### 4. Tool Registration Changes

**Before (using FastMCP):**
```javascript
server.addTool({
  name: 'get_operation_status',
  description: 'Get the status of an asynchronous operation',
  parameters: {
    type: 'object',
    required: ['operationId'],
    properties: {
      operationId: {
        type: 'string',
        description: 'ID of the operation to check'
      }
    }
  },
  handler: async ({ operationId }) => {
    // handler code
  }
});
```

**After (using MCP SDK with Zod):**
```javascript
server.tool(
  'get_operation_status',
  'Get the status of an asynchronous operation',
  z.object({
    operationId: z.string().describe('ID of the operation to check')
  }),
  async ({ operationId }) => {
    // handler code
  }
);
```

### 5. Server Stop/Disconnect Changes

**Before (using FastMCP):**
```javascript
async stop() {
  if (this.server) {
    await this.server.stop();
    logger.info('TaskFlow Memory Server stopped');
  }
}
```

**After (using MCP SDK):**
```javascript
async stop() {
  if (this.server) {
    await this.server.disconnect();
    logger.info('TaskFlow Memory Server stopped');
  }
}
```

## Key Benefits of Migration

1. **Official SDK Support:** Using the official MCP SDK ensures better compatibility with MCP clients and future updates.
2. **Strong Schema Validation:** Using Zod for schema validation provides better type safety and validation.
3. **Better Modularity:** Cleaner separation of concerns with dedicated transport modules.
4. **Future Proofing:** The official SDK will receive ongoing updates and features.

## Troubleshooting

### Common Issues and Solutions

1. **Missing Dependencies:**
   - Make sure to run `npm install` after updating package.json
   - Verify that `@modelcontextprotocol/sdk` and `zod` are installed

2. **Transport Connection Issues:**
   - For HTTP transport, verify the port is available
   - For stdio transport, ensure proper parent-child process communication

3. **Zod Validation Errors:**
   - Make sure all tool parameters match the defined Zod schema
   - Check required fields are being provided

## References

- [MCP TypeScript SDK Documentation](https://github.com/anthropics/mcp-sdk-typescript)
- [Zod Documentation](https://github.com/colinhacks/zod)
