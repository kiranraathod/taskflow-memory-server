/**
 * tools/index.js
 * Export all tools for TaskFlow Memory server
 */

import { z } from 'zod';
import { registerMemoryBankTools } from './memory-bank-tools/index.js';
import { registerPlanActTools } from './plan-act-tools/index.js';
import { modeManager } from '../core/plan-act/index.js';
import { getAICacheStats } from '../core/utils/ai-client.js';
import logger from '../logger.js';

/**
 * Register all tools with the TaskFlow server
 * @param {Object} server - MCP server instance
 * @param {Object} asyncManager - Async operation manager
 * @param {Object} memoryManager - Memory Manager instance
 */
export function registerTaskflowTools(server, asyncManager, memoryManager) {
	try {
		// Register Memory Bank tools
		registerMemoryBankTools(server, asyncManager);
		
		// Register Plan-Act tools
		registerPlanActTools(server, asyncManager);
		
		// Register operation status tool
		server.tool(
			'get_operation_status',
			'Get the status of an asynchronous operation',
			z.object({
				operationId: z.string().describe('ID of the operation to check')
			}),
			async ({ operationId }) => {
				try {
					const status = asyncManager.getOperationStatus(operationId);
					
					if (!status) {
						return {
							success: false,
							error: `Operation not found: ${operationId}`
						};
					}
					
					return {
						success: true,
						operationId,
						status: status.status,
						startTime: status.startTime,
						endTime: status.endTime,
						duration: status.duration
					};
				} catch (error) {
					logger.error(`Failed to get operation status: ${error.message}`, { operationId, error });
					
					return {
						success: false,
						error: error.message
					};
				}
			}
		);
		
		// Register operation result tool
		server.tool(
			'get_operation_result',
			'Get the result of a completed asynchronous operation',
			z.object({
				operationId: z.string().describe('ID of the operation to get results for')
			}),
			async ({ operationId }) => {
				try {
					const result = asyncManager.getOperationResult(operationId);
					
					if (!result) {
						return {
							success: false,
							error: `Operation not found: ${operationId}`
						};
					}
					
					return {
						success: true,
						operationId,
						status: result.status,
						result: result.result,
						error: result.error,
						startTime: result.startTime,
						endTime: result.endTime,
						duration: result.duration
					};
				} catch (error) {
					logger.error(`Failed to get operation result: ${error.message}`, { operationId, error });
					
					return {
						success: false,
						error: error.message
					};
				}
			}
		);
		
		// Register system status tool
		server.tool(
			'get_system_status',
			'Get the current status of the TaskFlow system',
			z.object({}),
			async () => {
				try {
					// Get Memory Manager stats
					const memoryStats = memoryManager.getStats();
					
					// Get Async Manager stats
					const asyncStats = asyncManager.getStats();
					
					// Get AI Cache stats
					const aiCacheStats = getAICacheStats();
					
					// Get Mode Manager state
					const modeState = {
						currentMode: modeManager.getCurrentMode()
					};
					
					return {
						success: true,
						status: {
							server: {
								name: 'TaskFlow Memory Server',
								uptime: process.uptime(),
								memory: process.memoryUsage()
							},
							memory: memoryStats,
							async: asyncStats,
							ai: aiCacheStats,
							mode: modeState
						}
					};
				} catch (error) {
					logger.error(`Failed to get system status: ${error.message}`, { error });
					
					return {
						success: false,
						error: error.message
					};
				}
			}
		);
		
		// Register get current mode tool
		server.tool(
			'get_current_mode',
			'Get the current operating mode (plan or act)',
			z.object({}),
			async () => {
				try {
					const currentMode = modeManager.getCurrentMode();
					
					return {
						success: true,
						mode: currentMode
					};
				} catch (error) {
					logger.error(`Failed to get current mode: ${error.message}`, { error });
					
					return {
						success: false,
						error: error.message
					};
				}
			}
		);
		
		logger.info('All TaskFlow tools registered successfully');
	} catch (error) {
		logger.error(`Error registering TaskFlow tools: ${error.message}`, { error });
		throw error;
	}
}

export default {
	registerTaskflowTools
};
