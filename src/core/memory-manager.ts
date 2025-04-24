/**
 * memory-manager.ts
 * Core manager for Memory Bank files and operations
 */

import fs from 'fs-extra';
import path from 'path';
import { logger } from '../logger.js';

// Default memory bank path (can be overridden by env variable)
const DEFAULT_MEMORY_BANK_PATH = './memory-bank';

export class MemoryManager {
  private static instance: MemoryManager;
  private memoryBankPath: string;
  private initialized: boolean;
  
  private constructor() {
    this.memoryBankPath = process.env.MEMORY_BANK_PATH || DEFAULT_MEMORY_BANK_PATH;
    this.initialized = false;
  }
  
  /**
   * Get the singleton instance of MemoryManager
   * @returns MemoryManager instance
   */
  public static getInstance(): MemoryManager {
    if (!MemoryManager.instance) {
      MemoryManager.instance = new MemoryManager();
    }
    
    return MemoryManager.instance;
  }
  
  /**
   * Initialize the Memory Manager
   */
  public async init(): Promise<void> {
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
      const err = error as Error;
      logger.error(`Failed to initialize Memory Bank: ${err.message}`);
      throw error;
    }
  }
  
  /**
   * Ensure default Memory Bank files exist
   */
  private async ensureDefaultFiles(): Promise<void> {
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
  public getMemoryBankPath(): string {
    return this.memoryBankPath;
  }
  
  /**
   * Read a Memory Bank file
   * @param fileName File name
   * @returns File content
   */
  public async readMemoryFile(fileName: string): Promise<string> {
    try {
      const filePath = path.join(this.memoryBankPath, fileName);
      const content = await fs.readFile(filePath, 'utf8');
      return content;
    } catch (error) {
      const err = error as Error;
      logger.error(`Failed to read Memory Bank file ${fileName}: ${err.message}`);
      throw error;
    }
  }
  
  /**
   * Write content to a Memory Bank file
   * @param fileName File name
   * @param content File content
   */
  public async writeMemoryFile(fileName: string, content: string): Promise<void> {
    try {
      const filePath = path.join(this.memoryBankPath, fileName);
      await fs.ensureDir(path.dirname(filePath));
      await fs.writeFile(filePath, content);
      logger.info(`Updated Memory Bank file: ${fileName}`);
    } catch (error) {
      const err = error as Error;
      logger.error(`Failed to write Memory Bank file ${fileName}: ${err.message}`);
      throw error;
    }
  }
  
  /**
   * Get all Memory Bank files
   * @returns List of file names
   */
  public async listMemoryFiles(): Promise<string[]> {
    try {
      const files = await fs.readdir(this.memoryBankPath);
      return files.filter(file => file.endsWith('.md'));
    } catch (error) {
      const err = error as Error;
      logger.error(`Failed to list Memory Bank files: ${err.message}`);
      throw error;
    }
  }
  
  /**
   * Get statistics about the Memory Bank
   * @returns Memory Bank statistics
   */
  public async getStats(): Promise<any> {
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
      const err = error as Error;
      logger.error(`Failed to get Memory Bank stats: ${err.message}`);
      return {
        error: err.message,
        initialized: this.initialized
      };
    }
  }
}

// Export the singleton instance
export default MemoryManager;
