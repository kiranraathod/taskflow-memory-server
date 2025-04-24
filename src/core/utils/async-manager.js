/**
 * async-manager.js
 * Manages asynchronous operations for the TaskFlow Memory Server
 */

import { v4 as uuidv4 } from 'uuid';
import logger from '../../logger.js';

class AsyncOperationManager {
  constructor() {
    this.operations = new Map();
  }

  /**
   * Start a new asynchronous operation
   * @returns {string} Operation ID
   */
  startOperation() {
    const operationId = uuidv4();
    this.operations.set(operationId, {
      status: 'pending',
      startTime: Date.now()
    });
    
    return operationId;
  }

  /**
   * Complete an operation with a result
   * @param {string} operationId Operation ID
   * @param {*} result Operation result
   */
  completeOperation(operationId, result) {
    const operation = this.operations.get(operationId);
    
    if (!operation) {
      logger.warn(`Attempted to complete unknown operation: ${operationId}`);
      return;
    }
    
    const endTime = Date.now();
    const duration = endTime - operation.startTime;
    
    this.operations.set(operationId, {
      ...operation,
      status: 'completed',
      endTime,
      duration,
      result
    });
    
    // Clean up old operations after 1 hour
    setTimeout(() => {
      this.operations.delete(operationId);
    }, 3600000);
  }

  /**
   * Fail an operation with an error
   * @param {string} operationId Operation ID
   * @param {Error|string} error Error message or object
   */
  failOperation(operationId, error) {
    const operation = this.operations.get(operationId);
    
    if (!operation) {
      logger.warn(`Attempted to fail unknown operation: ${operationId}`);
      return;
    }
    
    const endTime = Date.now();
    const duration = endTime - operation.startTime;
    const errorMessage = error instanceof Error ? error.message : error;
    
    this.operations.set(operationId, {
      ...operation,
      status: 'failed',
      endTime,
      duration,
      error: errorMessage
    });
    
    // Clean up old operations after 1 hour
    setTimeout(() => {
      this.operations.delete(operationId);
    }, 3600000);
  }

  /**
   * Get operation status
   * @param {string} operationId Operation ID
   * @returns {Object|null} Operation status or null if not found
   */
  getOperationStatus(operationId) {
    return this.operations.get(operationId) || null;
  }

  /**
   * Get operation result
   * @param {string} operationId Operation ID
   * @returns {Object|null} Operation status with result or null if not found
   */
  getOperationResult(operationId) {
    const operation = this.operations.get(operationId);
    
    if (!operation) {
      return null;
    }
    
    return operation;
  }

  /**
   * Get statistics about operations
   * @returns {Object} Operation statistics
   */
  getStats() {
    const pending = Array.from(this.operations.values()).filter(op => op.status === 'pending');
    const completed = Array.from(this.operations.values()).filter(op => op.status === 'completed');
    const failed = Array.from(this.operations.values()).filter(op => op.status === 'failed');
    
    return {
      total: this.operations.size,
      pending: pending.length,
      completed: completed.length,
      failed: failed.length,
      averageDuration: this.calculateAverageDuration()
    };
  }

  /**
   * Calculate average duration of completed operations
   * @returns {number} Average duration in milliseconds
   */
  calculateAverageDuration() {
    const completedOps = Array.from(this.operations.values())
      .filter(op => op.status !== 'pending' && op.duration !== undefined);
    
    if (completedOps.length === 0) {
      return 0;
    }
    
    const totalDuration = completedOps.reduce((sum, op) => sum + (op.duration || 0), 0);
    return totalDuration / completedOps.length;
  }
}

// Create singleton instance
export const asyncOperationManager = new AsyncOperationManager();

export default asyncOperationManager;
