/**
 * memory-manager.js
 * Core manager for Memory Bank files and operations
 */

import fs from 'fs-extra';
import path from 'path';
import logger from '../logger.js';

// Default memory bank path (can be overridden by env variable)
const DEFAULT_MEMORY_BANK_PATH = './memory-bank';

export class MemoryManager {
  static instance;
  
  constructor() {
    this.memoryBankPath = process.env.MEMORY_BANK_PATH || DEFAULT_MEMORY_BANK_PATH;
    this.initialized = false;
  }
  
  /**
   * Get the singleton instance of MemoryManager
   * @returns MemoryManager instance
   */
  static getInstance() {
    if (!MemoryManager.instance) {
      MemoryManager.instance = new MemoryManager();
    }
    
    return MemoryManager.instance;
  }
  
  /**
   * Initialize the Memory Manager
   */
  async init() {
    if (this.initialized) {
      return;
    }
    
    try {
      // Ensure memory bank directory exists
      await fs.ensureDir(this.memoryBankPath);
      logger.info(`Memory Bank initialized at: ${this.memoryBankPath}`);
      
      // Create default files if they don't exist
      await this.ensureDefaultFiles();
      
      this.initialized = true;
    } catch (error) {
      logger.error(`Failed to initialize Memory Bank: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Ensure default Memory Bank files exist
   */
  async ensureDefaultFiles() {
    const defaultFiles = [
      {
        name: 'projectbrief.md',
        content: '# Project Brief\n\nDefine your project requirements and goals here.\n'
      },
      {
        name: 'activeContext.md',
        content: '# Active Context\n\nTrack your current focus and recent changes here.\n'
      },
      {
        name: 'progress.md',
        content: '# Progress\n\nDocument your project progress and next steps here.\n'
      }
    ];
    
    for (const file of defaultFiles) {
      const filePath = path.join(this.memoryBankPath, file.name);
      
      if (!await fs.pathExists(filePath)) {
        await fs.writeFile(filePath, file.content);
        logger.info(`Created default Memory Bank file: ${file.name}`);
      }
    }
  }
  
  /**
   * Get the path to the Memory Bank
   * @returns Memory Bank path
   */
  getMemoryBankPath() {
    return this.memoryBankPath;
  }
  
  /**
   * Read a Memory Bank file
   * @param {string} fileName File name
   * @returns {Promise<string>} File content
   */
  async readMemoryFile(fileName) {
    try {
      const filePath = path.join(this.memoryBankPath, fileName);
      const content = await fs.readFile(filePath, 'utf8');
      return content;
    } catch (error) {
      logger.error(`Failed to read Memory Bank file ${fileName}: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Write content to a Memory Bank file
   * @param {string} fileName File name
   * @param {string} content File content
   */
  async writeMemoryFile(fileName, content) {
    try {
      const filePath = path.join(this.memoryBankPath, fileName);
      await fs.ensureDir(path.dirname(filePath));
      await fs.writeFile(filePath, content);
      logger.info(`Updated Memory Bank file: ${fileName}`);
    } catch (error) {
      logger.error(`Failed to write Memory Bank file ${fileName}: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Get all Memory Bank files
   * @returns {Promise<string[]>} List of file names
   */
  async listMemoryFiles() {
    try {
      const files = await fs.readdir(this.memoryBankPath);
      return files.filter(file => file.endsWith('.md'));
    } catch (error) {
      logger.error(`Failed to list Memory Bank files: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Get statistics about the Memory Bank
   * @returns {Promise<object>} Memory Bank statistics
   */
  async getStats() {
    try {
      const files = await this.listMemoryFiles();
      
      const totalSize = await files.reduce(async (promise, file) => {
        const total = await promise;
        const filePath = path.join(this.memoryBankPath, file);
        const stats = await fs.stat(filePath);
        return total + stats.size;
      }, Promise.resolve(0));
      
      return {
        path: this.memoryBankPath,
        files: files.length,
        totalSize: totalSize,
        initialized: this.initialized
      };
    } catch (error) {
      logger.error(`Failed to get Memory Bank stats: ${error.message}`);
      return {
        error: error.message,
        initialized: this.initialized
      };
    }
  }
}

// Export the singleton instance
export default MemoryManager;
