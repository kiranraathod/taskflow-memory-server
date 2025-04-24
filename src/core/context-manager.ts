/**
 * context-manager.ts
 * Manages context information with caching and Memory Bank integration
 */

import { LRUCache } from 'lru-cache';
import { MemoryManager } from './memory-manager.js';
import { logger } from '../logger.js';

// Context cache options
const CACHE_OPTIONS = {
  max: 100, // Maximum number of items in cache
  ttl: 1000 * 60 * 15, // 15 minutes TTL
};

class ContextManager {
  private memoryManager: MemoryManager;
  private contextCache: LRUCache<string, any>;
  
  constructor() {
    this.memoryManager = MemoryManager.getInstance();
    this.contextCache = new LRUCache(CACHE_OPTIONS);
  }
  
  /**
   * Get context from Memory Bank or cache
   * @param contextKey Context key
   * @returns Context data
   */
  async getContext(contextKey: string): Promise<any> {
    // Try to get from cache first
    const cachedContext = this.contextCache.get(contextKey);
    if (cachedContext) {
      logger.debug(`Context cache hit for: ${contextKey}`);
      return cachedContext;
    }
    
    // Otherwise load from Memory Bank
    try {
      logger.debug(`Context cache miss for: ${contextKey}, loading from Memory Bank`);
      
      // For now, we treat contextKey as a file name
      const content = await this.memoryManager.readMemoryFile(contextKey);
      
      // Cache the result
      this.contextCache.set(contextKey, content);
      
      return content;
    } catch (error) {
      const err = error as Error;
      logger.error(`Failed to get context for ${contextKey}: ${err.message}`);
      throw error;
    }
  }
  
  /**
   * Update context in Memory Bank and cache
   * @param contextKey Context key
   * @param contextData Context data
   */
  async updateContext(contextKey: string, contextData: any): Promise<void> {
    try {
      // Write to Memory Bank
      await this.memoryManager.writeMemoryFile(contextKey, contextData);
      
      // Update cache
      this.contextCache.set(contextKey, contextData);
      
      logger.debug(`Updated context for: ${contextKey}`);
    } catch (error) {
      const err = error as Error;
      logger.error(`Failed to update context for ${contextKey}: ${err.message}`);
      throw error;
    }
  }
  
  /**
   * Invalidate context in cache
   * @param contextKey Context key
   */
  invalidateContext(contextKey: string): void {
    this.contextCache.delete(contextKey);
    logger.debug(`Invalidated cache for: ${contextKey}`);
  }
  
  /**
   * Get all context keys from Memory Bank
   * @returns List of context keys
   */
  async getAllContextKeys(): Promise<string[]> {
    try {
      return await this.memoryManager.listMemoryFiles();
    } catch (error) {
      const err = error as Error;
      logger.error(`Failed to get all context keys: ${err.message}`);
      throw error;
    }
  }
  
  /**
   * Get complete context from all Memory Bank files
   * @returns Combined context data
   */
  async getCompleteContext(): Promise<Map<string, string>> {
    try {
      const files = await this.memoryManager.listMemoryFiles();
      const context = new Map<string, string>();
      
      for (const file of files) {
        const content = await this.memoryManager.readMemoryFile(file);
        context.set(file, content);
      }
      
      return context;
    } catch (error) {
      const err = error as Error;
      logger.error(`Failed to get complete context: ${err.message}`);
      throw error;
    }
  }
}

// Create singleton instance
export const contextManager = new ContextManager();

export default contextManager;
