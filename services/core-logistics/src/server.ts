import dotenv from 'dotenv';
dotenv.config();
import app from './app';
import logger from './utils/logger';
import config from './config';
import { initSupabase, testConnection } from './utils/supabase';

const PORT = config.port;

// Initialize Supabase
initSupabase();

// Test database connection
testConnection().catch((error) => {
  logger.error('Failed to connect to database:', error);
});

// Start server
const server = app.listen(PORT, '0.0.0.0', () => {
  logger.info(`===========================================`);
  logger.info(`🚀 Core Logistics Service started successfully`);
  logger.info(`===========================================`);
  logger.info(`Environment: ${config.env}`);
  logger.info(`Port: ${PORT}`);
  logger.info(`Service URL: http://0.0.0.0:${PORT}`);
  logger.info(`===========================================`);
  logger.info(`Database: ${config.supabase.url}`);
  logger.info(`Analytics: ${config.analytics.enabled ? 'Enabled' : 'Disabled'}`);
  logger.info(`Cache TTL: ${config.cache.ttl} seconds`);
  logger.info(`===========================================`);
  logger.info(`CORS Allowed Origins:`);
  config.cors.allowedOrigins.forEach((origin) => {
    logger.info(`  - ${origin}`);
  });
  logger.info(`===========================================`);
  logger.info(`Endpoints:`);
  logger.info(`  - GET  /api/store/init`);
  logger.info(`  - POST /api/services/select`);
  logger.info(`  - GET  /api/services/context`);
  logger.info(`  - GET  /health`);
  logger.info(`===========================================`);
});

// Graceful shutdown
const gracefulShutdown = (signal: string) => {
  logger.info(`\n${signal} received. Starting graceful shutdown...`);

  server.close(() => {
    logger.info('HTTP server closed');
    logger.info('Shutdown complete. Goodbye! 👋');
    process.exit(0);
  });

  // Force shutdown after 30 seconds
  setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 30000);
};

// Handle termination signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason: Error) => {
  logger.error('Unhandled Rejection:', reason);
  if (config.env === 'development') {
    gracefulShutdown('UNHANDLED_REJECTION');
  }
});

// Handle uncaught exceptions
process.on('uncaughtException', (error: Error) => {
  logger.error('Uncaught Exception:', error);
  gracefulShutdown('UNCAUGHT_EXCEPTION');
});

export default server;
