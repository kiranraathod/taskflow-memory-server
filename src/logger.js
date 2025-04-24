/**
 * logger.js
 * Centralized logging for TaskFlow Memory Server
 */

import winston from 'winston';

// Configure default log level from environment or use 'info' as default
const logLevel = process.env.LOG_LEVEL || 'info';

// Create the logger instance
const logger = winston.createLogger({
  level: logLevel,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ level, message, timestamp }) => {
      return `${timestamp} [${level.toUpperCase()}] ${message}`;
    })
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    }),
    // Can add file transport here if needed
  ]
});

export default logger;
