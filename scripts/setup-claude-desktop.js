#!/usr/bin/env node

/**
 * Setup script for Claude for Desktop integration
 * 
 * This script helps configure TaskFlow Memory Server with Claude for Desktop
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';

// Get the directory of this script
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

async function main() {
  console.log('TaskFlow Memory Server - Claude for Desktop Setup');
  console.log('===============================================');
  console.log('This script will help you configure TaskFlow Memory Server with Claude for Desktop.');
  console.log('');

  // Get Claude for Desktop config directory
  let claudeConfigDir = await askQuestion('Enter the path to your Claude for Desktop config directory (or press Enter for default): ');
  
  if (!claudeConfigDir) {
    // Default locations by OS
    if (process.platform === 'win32') {
      claudeConfigDir = path.join(process.env.APPDATA || '', 'Claude Desktop');
    } else if (process.platform === 'darwin') {
      claudeConfigDir = path.join(process.env.HOME || '', 'Library', 'Application Support', 'Claude Desktop');
    } else {
      claudeConfigDir = path.join(process.env.HOME || '', '.config', 'Claude Desktop');
    }
    console.log(`Using default config path: ${claudeConfigDir}`);
  }

  // Make sure the directory exists
  if (!fs.existsSync(claudeConfigDir)) {
    console.log(`The directory ${claudeConfigDir} does not exist. Please create it or specify a different directory.`);
    rl.close();
    return;
  }

  // Get server path (default to the current directory)
  const serverPath = path.join(rootDir, 'server.js');
  const absoluteServerPath = path.resolve(serverPath);
  
  console.log(`Server path: ${absoluteServerPath}`);

  // Create MCP servers configuration
  const configPath = path.join(claudeConfigDir, 'config.json');
  let config = { mcpServers: {} };

  // Check if config already exists
  if (fs.existsSync(configPath)) {
    try {
      const existingConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      config = existingConfig;
      
      if (!config.mcpServers) {
        config.mcpServers = {};
      }
    } catch (error) {
      console.log(`Error reading existing config: ${error.message}`);
      console.log('Creating a new config file.');
    }
  }

  // Add/update TaskFlow server
  config.mcpServers.taskflow = {
    command: 'node',
    args: [absoluteServerPath]
  };

  // Serialize with proper formatting
  const configJson = JSON.stringify(config, null, 4);

  // Write config
  try {
    fs.writeFileSync(configPath, configJson);
    console.log(`Configuration saved to ${configPath}`);
    console.log('Next steps:');
    console.log('1. Restart Claude for Desktop');
    console.log('2. In Claude for Desktop, use the dropdown to select "taskflow" as your server');
    console.log('3. Start interacting with Claude using TaskFlow Memory Server');
  } catch (error) {
    console.error(`Error writing config: ${error.message}`);
  }

  rl.close();
}

main().catch(error => {
  console.error(`Error: ${error.message}`);
  rl.close();
});
