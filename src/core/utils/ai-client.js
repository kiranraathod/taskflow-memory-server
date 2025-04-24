/**
 * ai-client.js
 * Utility for interacting with AI services
 */

import logger from '../../logger.js';

// Simple cache for AI responses
const aiCache = new Map();

/**
 * Get AI-generated response
 * @param {string} prompt Prompt to send to AI
 * @param {Object} options Options for AI request
 * @returns {Promise<string>} AI response
 */
export async function getAIResponse(prompt, options = {}) {
  // Generate a cache key from prompt and options
  const cacheKey = JSON.stringify({ prompt, options });
  
  // Check if we have a cached response
  if (aiCache.has(cacheKey)) {
    logger.debug('Using cached AI response');
    return aiCache.get(cacheKey);
  }
  
  try {
    // This would normally call an external AI service
    // For now, just return a mock response
    
    // Check for required API key
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY environment variable not set');
    }
    
    // Simple response generation for now
    const response = `AI response to: ${prompt.substring(0, 50)}...`;
    
    // Cache the response
    aiCache.set(cacheKey, response);
    
    return response;
  } catch (error) {
    logger.error(`AI service error: ${error.message}`, { error });
    throw error;
  }
}

/**
 * Get statistics about the AI cache
 * @returns {Object} Cache statistics
 */
export function getAICacheStats() {
  return {
    size: aiCache.size,
    keys: Array.from(aiCache.keys()).map(key => {
      const data = JSON.parse(key);
      return {
        promptPreview: data.prompt.substring(0, 30) + '...',
        options: data.options
      };
    })
  };
}

export default {
  getAIResponse,
  getAICacheStats
};
