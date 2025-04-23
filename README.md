# TaskFlow Memory Server

A task management server with persistent memory architecture for maintaining context and managing workflow execution.

## Overview

TaskFlow Memory Server is a specialized server that combines task management features with a robust Memory Bank architecture for maintaining project context across sessions. The system is designed to support intelligent context-aware task management with persistent state.

## Features

- **Memory Bank System**: Maintains project context in structured Markdown files.
- **Context Management**: Provides mechanisms for tracking and updating project context.
- **Task Management**: Integrated functionality for task tracking and execution.
- **Plan/Act Modes**: Supports distinct planning and execution workflows.
- **AI Integration**: Uses Claude AI for intelligent planning and task management.
- **Persistent State**: Maintains context between sessions for continuous workflow.

## Core Components

- **Memory Manager**: Centralized component for Memory Bank file operations and validation.
- **Context Manager**: Manages context information with caching and Memory Bank integration.
- **Plan/Act Mode Engine**: Controls planning and execution workflows with mode-specific functionality.
- **Async Operation Manager**: Handles long-running operations with status tracking.
- **TaskFlow Tools**: Collection of tools for interacting with the system through the FastMCP protocol.

## Memory Bank Structure

The Memory Bank consists of core files that maintain project context:

- `projectbrief.md`: Foundation document defining core requirements and goals.
- `productContext.md`: Why the project exists and how it should work.
- `activeContext.md`: Current work focus and recent changes.
- `systemPatterns.md`: System architecture and key technical decisions.
- `techContext.md`: Technologies used and development setup.
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
4. Start the server with `npm start`

For detailed setup and usage instructions, see the [Getting Started Guide](docs/getting-started.md).

## Environment Configuration

```
ANTHROPIC_API_KEY=your_anthropic_api_key
MODEL=claude-3-7-sonnet-20250219
MAX_TOKENS=64000
TEMPERATURE=0.2
MEMORY_BANK_PATH=./memory-bank
LOG_LEVEL=info
```

## Using with FastMCP-compatible clients

TaskFlow Memory Server can be used with clients that support the FastMCP protocol. Configure your client to connect to the server and use the provided tools for interacting with the Memory Bank and managing tasks.

Example workflow:
```
Can you switch to Plan mode and generate a plan for implementing the file system integration?
```

### Claude for Desktop Integration

TaskFlow Memory Server is compatible with Claude for Desktop. To configure:

1. Navigate to your Claude for Desktop configuration directory
2. Copy the configuration from `config/claude-desktop.json`:
   ```json
   {
       "mcpServers": {
           "taskflow": {
               "command": "node",
               "args": [
                   "C:\\PATH\\TO\\taskflow-memory-server\\server.js"
               ]
           }
       }
   }
   ```
3. Update the path in the `args` array to point to your installation of TaskFlow Memory Server
4. Save the file and restart Claude for Desktop
5. Select "taskflow" as your server in Claude for Desktop

The TaskFlow Memory Server provides Claude for Desktop with:
- Persistent memory for context across conversations
- Task planning and execution workflow
- Structured knowledge management

Command examples:
```
Claude, can you create a task plan for my project?
Claude, please update the memory bank with our recent progress
Claude, retrieve project context from memory bank
```

## Documentation Updates

Memory Bank files should be updated when:

1. Discovering new project patterns
2. Implementing significant changes
3. When context needs clarification

Use the `update_memory_bank` tool to trigger a complete review and update of all Memory Bank files.

## Documentation

- [Getting Started Guide](docs/getting-started.md) - Basic setup and usage instructions
- [Technical Reference](docs/technical-reference.md) - Detailed technical documentation

## License

This project is licensed under the MIT License - see the LICENSE file for details.
