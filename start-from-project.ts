#!/usr/bin/env node

/**
 * start-from-project.ts
 * 
 * Helper script to start the TaskFlow Memory Server from any project directory
 * Uses the current working directory for the memory bank location
 */

import { spawn, ChildProcess } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Get the directory of this script
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create memory-bank directory in current working directory if it doesn't exist
const cwdMemoryBankPath = path.join(process.cwd(), 'memory-bank');
if (!fs.existsSync(cwdMemoryBankPath)) {
  console.log(`Creating memory-bank directory at: ${cwdMemoryBankPath}`);
  fs.mkdirSync(cwdMemoryBankPath, { recursive: true });
  
  // Copy template files if they exist in the server's default memory-bank
  const templateDir = path.join(__dirname, 'memory-bank');
  if (fs.existsSync(templateDir)) {
    const templateFiles = fs.readdirSync(templateDir);
    templateFiles.forEach(file => {
      const sourcePath = path.join(templateDir, file);
      const destPath = path.join(cwdMemoryBankPath, file);
      
      // Only copy if the destination file doesn't exist
      if (!fs.existsSync(destPath) && fs.statSync(sourcePath).isFile()) {
        fs.copyFileSync(sourcePath, destPath);
        console.log(`Copied template file: ${file}`);
      }
    });
  }
}

// Path to compiled server.js in dist folder
const serverPath = path.join(__dirname, 'dist', 'server.js');

// Command line arguments (pass through any args provided)
const args = [serverPath, '--memory-path', cwdMemoryBankPath, ...process.argv.slice(2)];

console.log(`Starting TaskFlow Memory Server with memory-bank at: ${cwdMemoryBankPath}`);

// Spawn the server process
const serverProcess: ChildProcess = spawn('node', args, {
  stdio: 'inherit', // Pipe stdin/stdout/stderr to parent process
  env: process.env
});

// Handle server process events
serverProcess.on('error', (err: Error) => {
  console.error(`Failed to start server: ${err.message}`);
  process.exit(1);
});

// Pass through exit code from server
serverProcess.on('close', (code: number | null) => {
  process.exit(code || 0);
});
