#!/usr/bin/env node

/**
 * update-dependencies.js
 * Helper script to update package.json for MCP SDK migration
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get directory of this script
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to package.json
const packageJsonPath = path.join(__dirname, 'package.json');

// Read package.json
let packageJson;
try {
  const packageJsonContent = fs.readFileSync(packageJsonPath, 'utf8');
  packageJson = JSON.parse(packageJsonContent);
} catch (error) {
  console.error(`Error reading package.json: ${error.message}`);
  process.exit(1);
}

// Remove FastMCP dependency
if (packageJson.dependencies.fastmcp) {
  delete packageJson.dependencies.fastmcp;
  console.log('✅ Removed FastMCP dependency');
}

// Add MCP SDK dependencies if not present
if (!packageJson.dependencies['@modelcontextprotocol/sdk']) {
  packageJson.dependencies['@modelcontextprotocol/sdk'] = '^1.0.0';
  console.log('✅ Added @modelcontextprotocol/sdk dependency');
}

if (!packageJson.dependencies['zod']) {
  packageJson.dependencies['zod'] = '^3.22.4';
  console.log('✅ Added zod dependency');
}

// Update/add TypeScript dependencies
if (!packageJson.devDependencies['typescript']) {
  packageJson.devDependencies['typescript'] = '^5.3.3';
  console.log('✅ Added typescript dev dependency');
}

if (!packageJson.devDependencies['@types/node']) {
  packageJson.devDependencies['@types/node'] = '^20.10.0';
  console.log('✅ Added @types/node dev dependency');
}

// Write updated package.json
try {
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  console.log('✅ Updated package.json with new dependencies');
  console.log('\nNext steps:');
  console.log('1. Run: npm install');
  console.log('2. Start the server: npm start');
} catch (error) {
  console.error(`Error writing package.json: ${error.message}`);
  process.exit(1);
}
