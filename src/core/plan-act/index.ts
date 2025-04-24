/**
 * plan-act/index.ts
 * Manages Plan/Act mode for TaskFlow Memory Server
 */

import { logger } from '../../logger.js';

type Mode = 'plan' | 'act';

/**
 * Mode Manager for controlling Plan/Act workflows
 */
class ModeManager {
  private currentMode: Mode;
  
  constructor() {
    // Default to plan mode
    this.currentMode = 'plan';
  }
  
  /**
   * Get the current operating mode
   * @returns Current mode (plan or act)
   */
  getCurrentMode(): Mode {
    return this.currentMode;
  }
  
  /**
   * Set the current operating mode
   * @param mode Mode to set (plan or act)
   */
  setMode(mode: Mode): void {
    if (mode !== 'plan' && mode !== 'act') {
      logger.error(`Invalid mode: ${mode}. Must be 'plan' or 'act'.`);
      return;
    }
    
    const oldMode = this.currentMode;
    this.currentMode = mode;
    
    logger.info(`Mode changed from ${oldMode} to ${mode}`);
  }
  
  /**
   * Check if current mode is Plan
   * @returns True if in Plan mode
   */
  isPlanMode(): boolean {
    return this.currentMode === 'plan';
  }
  
  /**
   * Check if current mode is Act
   * @returns True if in Act mode
   */
  isActMode(): boolean {
    return this.currentMode === 'act';
  }
}

// Create singleton instance
export const modeManager = new ModeManager();

export default modeManager;
