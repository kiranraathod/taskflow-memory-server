/**
 * index.ts
 * Main server implementation for TaskFlow Memory Server
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { HttpServerTransport } from '@modelcontextprotocol/sdk/server/http.js';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { logger } from './logger.js';
import { registerTaskflowTools } from './tools/index.js';
import { asyncOperationManager } from './core/utils/async-manager.js';
import { MemoryManager } from './core/memory-manager.js';
import { contextManager } from './core/context-manager.js';

// Load environment variables
dotenv.config();

// Constants
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Main TaskFlow Memory server class
 */
class TaskflowMemoryServer {
  private server: McpServer;
  private initialized: boolean;
  private version: string;
  
  constructor() {
    // Get version from package.json
    const packagePath = path.join(__dirname, '../package.json');
    this.version = '1.0.0';
    
    try {
      if (fs.existsSync(packagePath)) {
        const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
        this.version = packageJson.version;
      }
    } catch (error) {
      const err = error as Error;
      logger.warn(`Failed to read package.json: ${err.message}`);
    }
    
    // Initialize MCP server
    this.server = new McpServer(
      { name: 'TaskFlow Memory Server', version: this.version },
      { capabilities: { tools: {}, resources: {} } }
    );
    
    this.initialized = false;
    
    // Make managers accessible
    this.asyncManager = asyncOperationManager;
    this.memoryManager = MemoryManager.getInstance();
    this.contextManager = contextManager;
    
    // Bind methods
    this.init = this.init.bind(this);
    this.start = this.start.bind(this);
    this.stop = this.stop.bind(this);
    
    // Setup logging
    this.logger = logger;
  }
  
  // Expose managers as properties
  public readonly asyncManager: typeof asyncOperationManager;
  public readonly memoryManager: MemoryManager;
  public readonly contextManager: typeof contextManager;
  public readonly logger: typeof logger;
  
  /**
   * Initialize the TaskFlow server with necessary tools and routes
   */
  async init(): Promise<this> {
    if (this.initialized) return this;
    
    // Initialize the Memory Manager
    await this.memoryManager.init();
    
    // Register all tools with the server
    registerTaskflowTools(this.server, this.asyncManager, this.memoryManager);
    
    this.initialized = true;
    logger.info('TaskFlow Memory Server initialized');
    
    return this;
  }
  
  /**
   * Start the TaskFlow server
   * @param options Server start options
   */
  async start(options: { port?: number } = {}): Promise<this> {
    if (!this.initialized) {
      await this.init();
    }
    
    try {
      // If port is specified, use HTTP transport, otherwise use stdio
      if (options.port) {
        const httpTransport = new HttpServerTransport({ port: options.port });
        await this.server.connect(httpTransport);
        logger.info(`Using HTTP transport on port ${options.port}`);
      } else {
        const stdioTransport = new StdioServerTransport();
        await this.server.connect(stdioTransport);
        logger.info('Using stdio transport (compatible with Claude for Desktop)');
      }
      
      logger.info(`TaskFlow Memory Server started (version ${this.version})`);
      return this;
    } catch (error) {
      const err = error as Error;
      logger.error(`Failed to start server: ${err.message}`);
      throw error;
    }
  }
  
  /**
   * Stop the TaskFlow server
   */
  async stop(): Promise<void> {
    if (this.server) {
      await this.server.disconnect();
      logger.info('TaskFlow Memory Server stopped');
    }
  }
}

// Export managers for use in other modules
export { asyncOperationManager, MemoryManager, contextManager };

export default TaskflowMemoryServer;
