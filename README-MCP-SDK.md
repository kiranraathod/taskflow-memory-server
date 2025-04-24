# TaskFlow Memory Server (MCP SDK Version)

A task management server with persistent memory architecture for maintaining context and managing workflow execution. This version uses the official Model Context Protocol (MCP) TypeScript SDK.

## Overview

TaskFlow Memory Server is a specialized server that combines task management features with a robust Memory Bank architecture for maintaining project context across sessions. The system is designed to support intelligent context-aware task management with persistent state.

## Features

- **Memory Bank System**: Maintains project context in structured Markdown files.
- **Context Management**: Provides mechanisms for tracking and updating project context.
- **Task Management**: Integrated functionality for task tracking and execution.
- **Plan/Act Modes**: Supports distinct planning and execution workflows.
- **MCP SDK Integration**: Uses the official MCP TypeScript SDK for tool registration and communication.
- **TypeScript Support**: Fully typed codebase for improved developer experience.
- **Persistent State**: Maintains context between sessions for continuous workflow.

## Core Components

- **Memory Manager**: Centralized component for Memory Bank file operations and validation.
- **Context Manager**: Manages context information with caching and Memory Bank integration.
- **Plan/Act Mode Engine**: Controls planning and execution workflows with mode-specific functionality.
- **Async Operation Manager**: Handles long-running operations with status tracking.
- **TaskFlow Tools**: Collection of tools for interacting with the system through the MCP protocol.

## Memory Bank Structure

The Memory Bank consists of core files that maintain project context:

- `projectbrief.md`: Foundation document defining core requirements and goals.
- `activeContext.md`: Current work focus and recent changes.
- `progress.md`: Project status, what works, and what's next.

## Core Workflows

### Plan Mode

1. Read Memory Bank files to understand context
2. Analyze current project state
3. Develop strategy based on context
4. Present approach for execution
5. Update Memory Bank with plan details

### Act Mode

1. Check Memory Bank for relevant context
2. Update documentation as needed
3. Execute specific task
4. Document changes and update Memory Bank
5. Capture insights from task execution

## Available Tools

### Memory Bank Tools
- Read, write, and update Memory Bank files
- Get complete Memory Bank context
- Update the entire Memory Bank

### Plan-Act Tools
- Generate project plans
- Execute tasks
- Switch between Plan and Act modes
- Document task insights

### System Tools
- Get operation status and results
- Check system status
- Manage asynchronous operations

## Getting Started

1. Clone the repository
2. Create a `.env` file with required variables (see `.env.example`)
3. Install dependencies with `npm install`
4. Build the project with `npm run build`
5. Start the server with `npm start`

## Environment Configuration

```
ANTHROPIC_API_KEY=your_anthropic_api_key
MODEL=claude-3-7-sonnet-20250219
MAX_TOKENS=64000
TEMPERATURE=0.2
MEMORY_BANK_PATH=./memory-bank
LOG_LEVEL=info
```

## Using with MCP-compatible clients

TaskFlow Memory Server can be used with clients that support the MCP protocol. Configure your client to connect to the server and use the provided tools for interacting with the Memory Bank and managing tasks.

Example workflow:
```
Can you switch to Plan mode and generate a plan for implementing the file system integration?
```

### Claude for Desktop Integration

TaskFlow Memory Server is compatible with Claude for Desktop. To configure:

1. Navigate to your Claude for Desktop configuration directory
2. Create a configuration:
   ```json
   {
       "mcpServers": {
           "taskflow": {
               "command": "node",
               "args": [
                   "C:\\PATH\\TO\\taskflow-memory-server\\dist\\server.js"
               ]
           }
       }
   }
   ```
3. Update the path in the `args` array to point to your installation of TaskFlow Memory Server
4. Save the file and restart Claude for Desktop
5. Select "taskflow" as your server in Claude for Desktop

## Project Development Workflow

For project-specific development, we recommend the current working directory approach:

1. Configure .env with:
   ```
   MEMORY_BANK_PATH=./memory-bank
   ```

2. Initialize a new project:
   ```bash
   npm run init-project
   ```

3. Start the server from your project directory:
   ```bash
   npm run start-project
   ```

The server will automatically create a memory-bank directory in your current project folder.

## Documentation Updates

Memory Bank files should be updated when:

1. Discovering new project patterns
2. Implementing significant changes
3. When context needs clarification

Use the `update_memory_file` tool to update specific Memory Bank files with new information.

## Build and Development

- `npm run build` - Build the TypeScript project
- `npm start` - Start the server (after building)
- `npm run dev` - Development mode with auto-restart
- `npm run clean` - Clean the build directory
- `npm test` - Run tests


## License

This project is licensed under the MIT License - see the LICENSE file for details.
