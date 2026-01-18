"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app_1 = __importDefault(require("./app"));
const logger_1 = __importDefault(require("./utils/logger"));
const config_1 = __importDefault(require("./config"));
const supabase_1 = require("./utils/supabase");
const PORT = config_1.default.port;
// Initialize Supabase
(0, supabase_1.initSupabase)();
// Test database connection
(0, supabase_1.testConnection)().catch((error) => {
    logger_1.default.error('Failed to connect to database:', error);
});
// Start server
const server = app_1.default.listen(PORT, '0.0.0.0', () => {
    logger_1.default.info(`===========================================`);
    logger_1.default.info(`🚀 Core Logistics Service started successfully`);
    logger_1.default.info(`===========================================`);
    logger_1.default.info(`Environment: ${config_1.default.env}`);
    logger_1.default.info(`Port: ${PORT}`);
    logger_1.default.info(`Service URL: http://0.0.0.0:${PORT}`);
    logger_1.default.info(`===========================================`);
    logger_1.default.info(`Database: ${config_1.default.supabase.url}`);
    logger_1.default.info(`Analytics: ${config_1.default.analytics.enabled ? 'Enabled' : 'Disabled'}`);
    logger_1.default.info(`Cache TTL: ${config_1.default.cache.ttl} seconds`);
    logger_1.default.info(`===========================================`);
    logger_1.default.info(`CORS Allowed Origins:`);
    config_1.default.cors.allowedOrigins.forEach((origin) => {
        logger_1.default.info(`  - ${origin}`);
    });
    logger_1.default.info(`===========================================`);
    logger_1.default.info(`Endpoints:`);
    logger_1.default.info(`  - GET  /api/store/init`);
    logger_1.default.info(`  - POST /api/services/select`);
    logger_1.default.info(`  - GET  /api/services/context`);
    logger_1.default.info(`  - GET  /health`);
    logger_1.default.info(`===========================================`);
});
// Graceful shutdown
const gracefulShutdown = (signal) => {
    logger_1.default.info(`\n${signal} received. Starting graceful shutdown...`);
    server.close(() => {
        logger_1.default.info('HTTP server closed');
        logger_1.default.info('Shutdown complete. Goodbye! 👋');
        process.exit(0);
    });
    // Force shutdown after 30 seconds
    setTimeout(() => {
        logger_1.default.error('Forced shutdown after timeout');
        process.exit(1);
    }, 30000);
};
// Handle termination signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
// Handle unhandled promise rejections
process.on('unhandledRejection', (reason) => {
    logger_1.default.error('Unhandled Rejection:', reason);
    if (config_1.default.env === 'development') {
        gracefulShutdown('UNHANDLED_REJECTION');
    }
});
// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    logger_1.default.error('Uncaught Exception:', error);
    gracefulShutdown('UNCAUGHT_EXCEPTION');
});
exports.default = server;
//# sourceMappingURL=server.js.map