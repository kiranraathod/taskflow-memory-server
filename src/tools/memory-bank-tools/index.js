/**
 * memory-bank-tools/index.js
 * Tools for interacting with the Memory Bank
 */

import { z } from 'zod';
import logger from '../../logger.js';
import { contextManager } from '../../core/context-manager.js';

/**
 * Register Memory Bank tools with the MCP server
 * @param {Object} server - MCP server instance
 * @param {Object} asyncManager - Async operation manager instance
 */
export function registerMemoryBankTools(server, asyncManager) {
  const memoryManager = MemoryManager.getInstance();
  
  try {
    // Read Memory Bank file tool
    server.tool(
      'read_memory_file',
      'Read a file from the Memory Bank',
      z.object({
        fileName: z.string().describe('Name of the file to read from the Memory Bank')
      }),
      async ({ fileName }) => {
        try {
          const content = await memoryManager.readMemoryFile(fileName);
          
          return {
            success: true,
            fileName,
            content
          };
        } catch (error) {
          logger.error(`Failed to read Memory Bank file: ${error.message}`, { fileName, error });
          
          return {
            success: false,
            error: error.message
          };
        }
      }
    );
    
    // Write Memory Bank file tool
    server.tool(
      'write_memory_file',
      'Write content to a file in the Memory Bank',
      z.object({
        fileName: z.string().describe('Name of the file to write to the Memory Bank'),
        content: z.string().describe('Content to write to the file')
      }),
      async ({ fileName, content }) => {
        try {
          await memoryManager.writeMemoryFile(fileName, content);
          
          // Invalidate cache for this file
          contextManager.invalidateContext(fileName);
          
          return {
            success: true,
            fileName
          };
        } catch (error) {
          logger.error(`Failed to write Memory Bank file: ${error.message}`, { fileName, error });
          
          return {
            success: false,
            error: error.message
          };
        }
      }
    );
    
    // List Memory Bank files tool
    server.tool(
      'list_memory_files',
      'List all files in the Memory Bank',
      z.object({}),
      async () => {
        try {
          const files = await memoryManager.listMemoryFiles();
          
          return {
            success: true,
            files
          };
        } catch (error) {
          logger.error(`Failed to list Memory Bank files: ${error.message}`, { error });
          
          return {
            success: false,
            error: error.message
          };
        }
      }
    );
    
    // Get Memory Bank context tool
    server.tool(
      'get_memory_bank_context',
      'Get the complete context from all Memory Bank files',
      z.object({}),
      async () => {
        // Start asynchronous operation
        const operationId = asyncManager.startOperation();
        
        try {
          const contextMap = await contextManager.getCompleteContext();
          
          // Convert Map to Object for JSON serialization
          const context = {};
          for (const [key, value] of contextMap.entries()) {
            context[key] = value;
          }
          
          // Complete the operation
          asyncManager.completeOperation(operationId, context);
          
          return {
            success: true,
            operationId,
            message: `Started retrieving Memory Bank context. Use get_operation_result with operationId to get results.`
          };
        } catch (error) {
          logger.error(`Failed to get Memory Bank context: ${error.message}`, { error });
          
          // Fail the operation
          asyncManager.failOperation(operationId, error);
          
          return {
            success: false,
            operationId,
            error: error.message
          };
        }
      }
    );
    
    // Update Memory Bank file tool (like write but only successful if file exists)
    server.tool(
      'update_memory_file',
      'Update an existing file in the Memory Bank',
      z.object({
        fileName: z.string().describe('Name of the file to update in the Memory Bank'),
        content: z.string().describe('New content for the file')
      }),
      async ({ fileName, content }) => {
        try {
          // Check if file exists first
          await memoryManager.readMemoryFile(fileName);
          
          // Then write the new content
          await memoryManager.writeMemoryFile(fileName, content);
          
          // Invalidate cache
          contextManager.invalidateContext(fileName);
          
          return {
            success: true,
            fileName
          };
        } catch (error) {
          logger.error(`Failed to update Memory Bank file: ${error.message}`, { fileName, error });
          
          return {
            success: false,
            error: error.message
          };
        }
      }
    );
    
    logger.info('Memory Bank tools registered successfully');
  } catch (error) {
    logger.error(`Error registering Memory Bank tools: ${error.message}`, { error });
    throw error;
  }
}

// Make sure to import MemoryManager
import { MemoryManager } from '../../core/memory-manager.js';

export default { registerMemoryBankTools };
