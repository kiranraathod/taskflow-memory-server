/**
 * context-manager.js
 * Manages context information with caching and Memory Bank integration
 */

import { LRUCache } from 'lru-cache';
import { MemoryManager } from './memory-manager.js';
import logger from '../logger.js';

// Context cache options
const CACHE_OPTIONS = {
  max: 100, // Maximum number of items in cache
  ttl: 1000 * 60 * 15, // 15 minutes TTL
};

class ContextManager {
  constructor() {
    this.memoryManager = MemoryManager.getInstance();
    this.contextCache = new LRUCache(CACHE_OPTIONS);
  }
  
  /**
   * Get context from Memory Bank or cache
   * @param {string} contextKey Context key
   * @returns {Promise<*>} Context data
   */
  async getContext(contextKey) {
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
      logger.error(`Failed to get context for ${contextKey}: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Update context in Memory Bank and cache
   * @param {string} contextKey Context key
   * @param {*} contextData Context data
   */
  async updateContext(contextKey, contextData) {
    try {
      // Write to Memory Bank
      await this.memoryManager.writeMemoryFile(contextKey, contextData);
      
      // Update cache
      this.contextCache.set(contextKey, contextData);
      
      logger.debug(`Updated context for: ${contextKey}`);
    } catch (error) {
      logger.error(`Failed to update context for ${contextKey}: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Invalidate context in cache
   * @param {string} contextKey Context key
   */
  invalidateContext(contextKey) {
    this.contextCache.delete(contextKey);
    logger.debug(`Invalidated cache for: ${contextKey}`);
  }
  
  /**
   * Get all context keys from Memory Bank
   * @returns {Promise<string[]>} List of context keys
   */
  async getAllContextKeys() {
    try {
      return await this.memoryManager.listMemoryFiles();
    } catch (error) {
      logger.error(`Failed to get all context keys: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Get complete context from all Memory Bank files
   * @returns {Promise<Map<string, string>>} Combined context data
   */
  async getCompleteContext() {
    try {
      const files = await this.memoryManager.listMemoryFiles();
      const context = new Map();
      
      for (const file of files) {
        const content = await this.memoryManager.readMemoryFile(file);
        context.set(file, content);
      }
      
      return context;
    } catch (error) {
      logger.error(`Failed to get complete context: ${error.message}`);
      throw error;
    }
  }
}

// Create singleton instance
export const contextManager = new ContextManager();

export default contextManager;
