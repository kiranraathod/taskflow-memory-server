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

### 2. TypeScript Configuration

Added TypeScript support with a `tsconfig.json` file:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ES2022",
    "moduleResolution": "node",
    "esModuleInterop": true,
    "strict": true,
    "outDir": "dist",
    "sourceMap": true,
    "declaration": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src/**/*", "server.ts"],
  "exclude": ["node_modules", "dist"]
}
```

### 3. Server Initialization Changes

**Before (using FastMCP):**
```javascript
import { FastMCP } from 'fastmcp';

// ...

this.server = new FastMCP(this.options);
```

**After (using MCP SDK):**
```typescript
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

// ...

this.server = new McpServer(
  { name: 'TaskFlow Memory Server', version: this.version },
  { capabilities: { tools: {}, resources: {} } }
);
```

### 4. Transport Changes

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
```typescript
// If port is specified, use HTTP transport, otherwise use stdio
if (options.port) {
  const httpTransport = new HttpServerTransport({ port: options.port });
  await this.server.connect(httpTransport);
} else {
  const stdioTransport = new StdioServerTransport();
  await this.server.connect(stdioTransport);
}
```

### 5. Tool Registration Changes

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
```typescript
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

### 6. Server Stop/Disconnect Changes

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
```typescript
async stop(): Promise<void> {
  if (this.server) {
    await this.server.disconnect();
    logger.info('TaskFlow Memory Server stopped');
  }
}
```

## Key Benefits of Migration

1. **Official SDK Support:** Using the official MCP SDK ensures better compatibility with MCP clients and future updates.
2. **TypeScript Support:** Full TypeScript support improves code quality and developer experience.
3. **Zod Schema Validation:** Strong schema validation with Zod ensures better type safety for tools.
4. **Improved Modularity:** Cleaner separation of concerns with dedicated transport modules.
5. **Future Proofing:** The official SDK will receive ongoing updates and features.

## Breaking Changes and Considerations

1. **TypeScript Required:** The codebase now requires TypeScript.
2. **Build Step:** A build step is now required before running the server.
3. **Zod Schema Validation:** More strict schema validation might require updates to client code.
4. **Transport Configuration:** Different approach to configuring transports.

## Build and Run Instructions

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Build the Project:**
   ```bash
   npm run build
   ```

3. **Run the Server:**
   ```bash
   # With stdio transport (for Claude Desktop)
   npm start
   
   # With HTTP transport on port 3000
   npm start -- --port 3000
   ```

## Troubleshooting

### Common Issues and Solutions

1. **TypeScript Errors:**
   - Ensure TypeScript is installed: `npm install -D typescript`
   - Check tsconfig.json is properly configured

2. **Missing Imports:**
   - Make sure to use the correct import paths from the MCP SDK
   - Imports should include the file extension (e.g., `import { x } from './y.js'`)

3. **Zod Validation Errors:**
   - Ensure all parameters match the defined Zod schema
   - Check that required fields are provided and properly typed

4. **Transport Connection Issues:**
   - For HTTP transport, verify the port is available
   - For stdio transport, ensure proper parent-child process communication

## References

- [MCP TypeScript SDK Documentation](https://github.com/anthropics/mcp-sdk-typescript)
- [Zod Documentation](https://github.com/colinhacks/zod)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
