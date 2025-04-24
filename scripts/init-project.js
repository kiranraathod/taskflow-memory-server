#!/usr/bin/env node

/**
 * init-project.js
 * 
 * Initializes a new project directory with memory-bank files
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';

// Get script directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

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
  console.log('TaskFlow Memory Server - Project Initialization');
  console.log('=============================================');
  
  // Get project directory
  let projectDir = await askQuestion('Enter the path to your project directory (or press Enter for current directory): ');
  
  if (!projectDir) {
    projectDir = process.cwd();
  } else {
    // Resolve to absolute path if relative
    if (!path.isAbsolute(projectDir)) {
      projectDir = path.resolve(process.cwd(), projectDir);
    }
  }
  
  console.log(`\nInitializing project at: ${projectDir}`);
  
  // Create memory-bank directory
  const memoryBankDir = path.join(projectDir, 'memory-bank');
  
  if (!fs.existsSync(projectDir)) {
    console.log(`Creating project directory: ${projectDir}`);
    fs.mkdirSync(projectDir, { recursive: true });
  }
  
  if (!fs.existsSync(memoryBankDir)) {
    console.log(`Creating memory-bank directory: ${memoryBankDir}`);
    fs.mkdirSync(memoryBankDir, { recursive: true });
  } else {
    console.log(`Memory-bank directory already exists at: ${memoryBankDir}`);
  }
  
  // Copy template files
  const templateDir = path.join(rootDir, 'memory-bank');
  if (fs.existsSync(templateDir)) {
    const templateFiles = fs.readdirSync(templateDir);
    let filesCreated = 0;
    
    for (const file of templateFiles) {
      const sourcePath = path.join(templateDir, file);
      const destPath = path.join(memoryBankDir, file);
      
      // Only copy if the destination file doesn't exist
      if (!fs.existsSync(destPath) && fs.statSync(sourcePath).isFile()) {
        fs.copyFileSync(sourcePath, destPath);
        console.log(`Created template file: ${file}`);
        filesCreated++;
      }
    }
    
    if (filesCreated === 0) {
      console.log('All template files already exist. No files were copied.');
    } else {
      console.log(`\nSuccessfully initialized project with ${filesCreated} memory-bank files.`);
    }
  } else {
    console.log('Warning: Template directory not found. No files were copied.');
  }
  
  // Create project README with instructions
  const readmePath = path.join(projectDir, 'README.md');
  if (!fs.existsSync(readmePath)) {
    const readmeContent = `# Project with TaskFlow Memory Server

## Setup

This project uses TaskFlow Memory Server for task management and context persistence.

### Starting the server

From this project directory, run:

\`\`\`bash
# Navigate to the TaskFlow Memory Server directory
cd /path/to/taskflow-memory-server

# Start the server with this project's memory-bank
npm run start-project --prefix=/path/to/taskflow-memory-server
\`\`\`

Or create a shortcut/script for easy startup.

### Memory Bank

The \`memory-bank\` directory contains all persistent context for this project.
Key files:
- \`projectbrief.md\`: Core requirements and goals
- \`activeContext.md\`: Current work focus and recent changes

Update these files as your project evolves.
`;
    
    fs.writeFileSync(readmePath, readmeContent);
    console.log('Created project README.md with TaskFlow instructions.');
  }
  
  console.log('\nProject initialization complete!');
  console.log('\nTo start the server from this project, run:');
  console.log(`npm run start-project --prefix="${rootDir}"`);
  
  rl.close();
}

main().catch(error => {
  console.error(`Error: ${error.message}`);
  rl.close();
});
