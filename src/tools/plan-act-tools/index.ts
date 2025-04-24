/**
 * plan-act-tools/index.ts
 * Tools for Plan/Act mode operations
 */

import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { logger } from '../../logger.js';
import { asyncOperationManager } from '../../core/utils/async-manager.js';
import { modeManager } from '../../core/plan-act/index.js';
import { contextManager } from '../../core/context-manager.js';

/**
 * Register Plan-Act mode tools with the MCP server
 * @param server MCP server instance
 * @param asyncManager Async operation manager instance
 */
export function registerPlanActTools(server: McpServer, asyncManager: typeof asyncOperationManager): void {
  try {
    // Set mode tool
    server.tool(
      'set_mode',
      'Set the current operating mode (plan or act)',
      z.object({
        mode: z.enum(['plan', 'act']).describe('Mode to set (plan or act)')
      }),
      async ({ mode }) => {
        try {
          const previousMode = modeManager.getCurrentMode();
          modeManager.setMode(mode);
          
          return {
            success: true,
            previousMode,
            currentMode: mode
          };
        } catch (error) {
          const err = error as Error;
          logger.error(`Failed to set mode: ${err.message}`, { mode, error });
          
          return {
            success: false,
            error: err.message
          };
        }
      }
    );
    
    // Generate plan tool
    server.tool(
      'generate_plan',
      'Generate a task plan based on project context',
      z.object({
        taskDescription: z.string().describe('Description of the task to plan'),
        includeMemoryContext: z.boolean().optional().describe('Whether to include Memory Bank context in planning (default: true)')
      }),
      async ({ taskDescription, includeMemoryContext = true }) => {
        // Start asynchronous operation
        const operationId = asyncManager.startOperation();
        
        try {
          // Switch to plan mode if not already
          const previousMode = modeManager.getCurrentMode();
          if (!modeManager.isPlanMode()) {
            modeManager.setMode('plan');
            logger.info(`Switched from ${previousMode} to plan mode for planning`);
          }
          
          // This would normally call an AI service to generate a plan
          // For now, we just create a simple plan structure
          const plan = {
            task: taskDescription,
            steps: [
              { id: 1, description: `Analyze requirements for: ${taskDescription}` },
              { id: 2, description: 'Break down into implementable subtasks' },
              { id: 3, description: 'Prioritize subtasks and assign complexity' },
              { id: 4, description: 'Create implementation plan' },
              { id: 5, description: 'Define success criteria and validation approach' }
            ],
            estimatedEffort: 'medium',
            generatedAt: new Date().toISOString()
          };
          
          // Complete the operation with the plan
          asyncManager.completeOperation(operationId, plan);
          
          return {
            success: true,
            operationId,
            message: `Started generating plan for "${taskDescription}". Use get_operation_result with operationId to get results.`
          };
        } catch (error) {
          const err = error as Error;
          logger.error(`Failed to generate plan: ${err.message}`, { taskDescription, error });
          
          // Fail the operation
          asyncManager.failOperation(operationId, err);
          
          return {
            success: false,
            operationId,
            error: err.message
          };
        }
      }
    );
    
    // Execute task tool
    server.tool(
      'execute_task',
      'Execute a specific task with proper context',
      z.object({
        taskId: z.string().describe('ID of the task to execute'),
        taskDescription: z.string().describe('Description of the task to execute'),
        useMemoryContext: z.boolean().optional().describe('Whether to use Memory Bank context during execution (default: true)')
      }),
      async ({ taskId, taskDescription, useMemoryContext = true }) => {
        // Start asynchronous operation
        const operationId = asyncManager.startOperation();
        
        try {
          // Switch to act mode if not already
          const previousMode = modeManager.getCurrentMode();
          if (!modeManager.isActMode()) {
            modeManager.setMode('act');
            logger.info(`Switched from ${previousMode} to act mode for execution`);
          }
          
          // This would normally involve executing the task through an AI service or other means
          // For now, we just create a simple execution result
          const executionResult = {
            taskId,
            description: taskDescription,
            status: 'completed',
            startTime: new Date().toISOString(),
            endTime: new Date().toISOString(),
            outcome: `Successfully executed task: ${taskDescription}`,
            notes: 'This is a simulated task execution.'
          };
          
          // Complete the operation with the execution result
          asyncManager.completeOperation(operationId, executionResult);
          
          return {
            success: true,
            operationId,
            message: `Started executing task "${taskDescription}". Use get_operation_result with operationId to get results.`
          };
        } catch (error) {
          const err = error as Error;
          logger.error(`Failed to execute task: ${err.message}`, { taskId, taskDescription, error });
          
          // Fail the operation
          asyncManager.failOperation(operationId, err);
          
          return {
            success: false,
            operationId,
            error: err.message
          };
        }
      }
    );
    
    // Document insights tool
    server.tool(
      'document_insights',
      'Document insights from task execution',
      z.object({
        taskId: z.string().describe('ID of the task that generated insights'),
        taskDescription: z.string().describe('Description of the task'),
        insights: z.string().describe('Insights to document'),
        updateMemoryBank: z.boolean().optional().describe('Whether to update Memory Bank with insights (default: true)')
      }),
      async ({ taskId, taskDescription, insights, updateMemoryBank = true }) => {
        try {
          const insightRecord = {
            taskId,
            description: taskDescription,
            insights,
            timestamp: new Date().toISOString()
          };
          
          // If updateMemoryBank is true, update the activeContext file
          if (updateMemoryBank) {
            try {
              // Get current active context
              const activeContext = await contextManager.getContext('activeContext.md');
              
              // Append insights
              const updatedContext = `${activeContext}\n\n## Insights from Task ${taskId}\n\n${insights}\n\n_Documented at ${new Date().toISOString()}_\n`;
              
              // Write back to active context
              await contextManager.updateContext('activeContext.md', updatedContext);
              
              logger.info(`Updated activeContext.md with insights from task ${taskId}`);
            } catch (error) {
              const err = error as Error;
              logger.error(`Failed to update Memory Bank with insights: ${err.message}`, { taskId, error });
              
              return {
                success: false,
                error: err.message
              };
            }
          }
          
          return {
            success: true,
            insightRecord
          };
        } catch (error) {
          const err = error as Error;
          logger.error(`Failed to document insights: ${err.message}`, { taskId, error });
          
          return {
            success: false,
            error: err.message
          };
        }
      }
    );
    
    logger.info('Plan-Act tools registered successfully');
  } catch (error) {
    const err = error as Error;
    logger.error(`Error registering Plan-Act tools: ${err.message}`, { error });
    throw error;
  }
}

export default { registerPlanActTools };
