/**
 * async-manager.ts
 * Manages asynchronous operations for the TaskFlow Memory Server
 */

import { v4 as uuidv4 } from 'uuid';
import { logger } from '../../logger.js';

interface OperationStatus {
  status: 'pending' | 'completed' | 'failed';
  startTime: number;
  endTime?: number;
  duration?: number;
  result?: any;
  error?: string;
}

class AsyncOperationManager {
  private operations: Map<string, OperationStatus>;

  constructor() {
    this.operations = new Map();
  }

  /**
   * Start a new asynchronous operation
   * @returns Operation ID
   */
  startOperation(): string {
    const operationId = uuidv4();
    this.operations.set(operationId, {
      status: 'pending',
      startTime: Date.now()
    });
    
    return operationId;
  }

  /**
   * Complete an operation with a result
   * @param operationId Operation ID
   * @param result Operation result
   */
  completeOperation(operationId: string, result: any): void {
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
   * @param operationId Operation ID
   * @param error Error message or object
   */
  failOperation(operationId: string, error: Error | string): void {
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
   * @param operationId Operation ID
   * @returns Operation status or null if not found
   */
  getOperationStatus(operationId: string): OperationStatus | null {
    return this.operations.get(operationId) || null;
  }

  /**
   * Get operation result
   * @param operationId Operation ID
   * @returns Operation status with result or null if not found
   */
  getOperationResult(operationId: string): OperationStatus | null {
    const operation = this.operations.get(operationId);
    
    if (!operation) {
      return null;
    }
    
    return operation;
  }

  /**
   * Get statistics about operations
   * @returns Operation statistics
   */
  getStats(): any {
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
   * @returns Average duration in milliseconds
   */
  private calculateAverageDuration(): number {
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
