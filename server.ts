#!/usr/bin/env node

import TaskflowMemoryServer from './src/index.js';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { logger } from './src/logger.js';

// Load environment variables - prioritize from working directory first, then server directory
try {
  const localEnvPath = path.join(process.cwd(), '.env');
  if (fs.existsSync(localEnvPath)) {
    dotenv.config({ path: localEnvPath });
    logger.info(`Loaded environment from ${localEnvPath}`);
  } else {
    dotenv.config();
    logger.info('Loaded environment from default location');
  }
} catch (error) {
  const err = error as Error;
  logger.warn(`Error loading environment variables: ${err.message}`);
  dotenv.config(); // Fallback to default
}

/**
 * Start the TaskFlow Memory server
 */
async function startServer() {
  // Parse any command-line options
  const args = process.argv.slice(2);
  const options: { port?: number } = {};
  
  // Process any command-line arguments
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--port' && i + 1 < args.length) {
      options.port = parseInt(args[i + 1], 10);
      i++;
    } else if (args[i] === '--memory-path' && i + 1 < args.length) {
      process.env.MEMORY_BANK_PATH = args[i + 1];
      i++;
    } else if (args[i] === '--log-level' && i + 1 < args.length) {
      process.env.LOG_LEVEL = args[i + 1];
      i++;
    } else if (args[i] === '--help') {
      console.log(`
TaskFlow Memory Server - Context-aware task management server

Usage:
  node server.js [options]

Options:
  --port NUMBER         Port for HTTP transport (defaults to stdio transport)
  --memory-path PATH    Path to memory bank directory
  --log-level LEVEL     Logging level (debug, info, warn, error)
  --help                Show this help message
      `);
      process.exit(0);
    }
  }

  const server = new TaskflowMemoryServer();

  // Handle graceful shutdown
  process.on('SIGINT', async () => {
    await server.stop();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    await server.stop();
    process.exit(0);
  });

  try {
    await server.start(options);
    logger.info('TaskFlow Memory server started successfully');
  } catch (error) {
    const err = error as Error;
    logger.error(`Failed to start TaskFlow Memory server: ${err.message}`);
    process.exit(1);
  }
}

// Start the server
startServer();
