/**
 * plan-act/index.js
 * Manages Plan/Act mode for TaskFlow Memory Server
 */

import logger from '../../logger.js';

/**
 * Mode Manager for controlling Plan/Act workflows
 */
class ModeManager {
  constructor() {
    // Default to plan mode
    this.currentMode = 'plan';
  }
  
  /**
   * Get the current operating mode
   * @returns {string} Current mode (plan or act)
   */
  getCurrentMode() {
    return this.currentMode;
  }
  
  /**
   * Set the current operating mode
   * @param {string} mode Mode to set (plan or act)
   */
  setMode(mode) {
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
   * @returns {boolean} True if in Plan mode
   */
  isPlanMode() {
    return this.currentMode === 'plan';
  }
  
  /**
   * Check if current mode is Act
   * @returns {boolean} True if in Act mode
   */
  isActMode() {
    return this.currentMode === 'act';
  }
}

// Create singleton instance
export const modeManager = new ModeManager();

export default modeManager;
