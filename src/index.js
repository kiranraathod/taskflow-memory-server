/**
 * index.js
 * Main server implementation for TaskFlow Memory Server
 */

import { FastMCP } from 'fastmcp';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import fs from 'fs';
import logger from './logger.js';
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
	constructor() {
		// Get version from package.json
		const packagePath = path.join(__dirname, '../package.json');
		let version = '1.0.0';
		
		try {
			if (fs.existsSync(packagePath)) {
				const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
				version = packageJson.version;
			}
		} catch (error) {
			logger.warn(`Failed to read package.json: ${error.message}`);
		}

		this.options = {
			name: 'TaskFlow Memory Server',
			version: version
		};

		this.server = new FastMCP(this.options);
		this.initialized = false;

		// Resource templates
		this.server.addResource({});
		this.server.addResourceTemplate({});

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

	/**
	 * Initialize the TaskFlow server with necessary tools and routes
	 */
	async init() {
		if (this.initialized) return;

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
	 * @param {Object} options - Server start options
	 * @param {number} [options.port] - Port for HTTP transport
	 */
	async start(options = {}) {
		if (!this.initialized) {
			await this.init();
		}

		// Configure server startup options
		const startOptions = {
			timeout: 120000 // 2 minutes timeout
		};
		
		// If port is specified, use HTTP transport, otherwise use stdio
		if (options.port) {
			startOptions.transportType = 'http';
			startOptions.port = options.port;
			logger.info(`Using HTTP transport on port ${options.port}`);
		} else {
			startOptions.transportType = 'stdio';
			logger.info('Using stdio transport (compatible with Claude for Desktop)');
		}

		// Start the FastMCP server
		await this.server.start(startOptions);

		logger.info(`TaskFlow Memory Server started (version ${this.options.version})`);
		return this;
	}

	/**
	 * Stop the TaskFlow server
	 */
	async stop() {
		if (this.server) {
			await this.server.stop();
			logger.info('TaskFlow Memory Server stopped');
		}
	}
}

// Export managers for use in other modules
export { asyncOperationManager, MemoryManager, contextManager };

export default TaskflowMemoryServer;
