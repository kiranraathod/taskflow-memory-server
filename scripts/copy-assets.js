#!/usr/bin/env node

/**
 * copy-assets.js
 * 
 * This script copies non-TypeScript files to the dist directory
 * to ensure all necessary assets are available after build
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get script directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');

// Ensure dist directory exists
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// Helper function to copy recursively
function copyRecursive(src, dest) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();
  
  if (isDirectory) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    
    fs.readdirSync(src).forEach(childItemName => {
      copyRecursive(
        path.join(src, childItemName),
        path.join(dest, childItemName)
      );
    });
  } else {
    // Skip TypeScript files and files in node_modules
    if (!src.includes('node_modules') && 
        !src.endsWith('.ts') && 
        !src.endsWith('.tsx') && 
        !src.includes('dist/')) {
      // Create directory if it doesn't exist
      const dirName = path.dirname(dest);
      if (!fs.existsSync(dirName)) {
        fs.mkdirSync(dirName, { recursive: true });
      }
      
      // Copy the file
      try {
        fs.copyFileSync(src, dest);
        console.log(`Copied: ${src} -> ${dest}`);
      } catch (error) {
        console.error(`Error copying ${src}: ${error.message}`);
      }
    }
  }
}

// Assets to copy
const assetsToCopy = [
  { src: path.join(rootDir, '.env.example'), dest: path.join(distDir, '.env.example') },
  { src: path.join(rootDir, 'memory-bank'), dest: path.join(distDir, 'memory-bank') },
  { src: path.join(rootDir, 'config'), dest: path.join(distDir, 'config') }
];

// Copy each asset
assetsToCopy.forEach(asset => {
  try {
    if (fs.existsSync(asset.src)) {
      const stats = fs.statSync(asset.src);
      
      if (stats.isDirectory()) {
        copyRecursive(asset.src, asset.dest);
        console.log(`Copied directory: ${asset.src} -> ${asset.dest}`);
      } else {
        // Create directory if it doesn't exist
        const dirName = path.dirname(asset.dest);
        if (!fs.existsSync(dirName)) {
          fs.mkdirSync(dirName, { recursive: true });
        }
        
        fs.copyFileSync(asset.src, asset.dest);
        console.log(`Copied file: ${asset.src} -> ${asset.dest}`);
      }
    } else {
      console.warn(`Warning: Asset not found: ${asset.src}`);
    }
  } catch (error) {
    console.error(`Error processing ${asset.src}: ${error.message}`);
  }
});

console.log('Asset copying complete.');
