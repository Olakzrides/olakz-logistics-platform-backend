"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const supabase_1 = require("../utils/supabase");
const service_channel_repository_1 = require("../repositories/service-channel.repository");
const logger_1 = __importDefault(require("../utils/logger"));
const router = (0, express_1.Router)();
router.get('/', async (_req, res) => {
    const checks = {};
    let overallStatus = 'healthy';
    let statusCode = 200;
    try {
        // Test database connection
        try {
            const dbHealthy = await (0, supabase_1.testConnection)();
            checks.database = {
                status: dbHealthy ? 'healthy' : 'unhealthy',
                message: dbHealthy ? 'Database connection successful' : 'Database connection failed'
            };
            if (!dbHealthy) {
                overallStatus = 'unhealthy';
                statusCode = 503;
            }
        }
        catch (error) {
            checks.database = {
                status: 'unhealthy',
                message: 'Database connection error',
                error: error instanceof Error ? error.message : 'Unknown error'
            };
            overallStatus = 'unhealthy';
            statusCode = 503;
            logger_1.default.error('Database health check failed:', error);
        }
        // Test service channels (optional - don't fail if this fails)
        try {
            const serviceChannelRepo = new service_channel_repository_1.ServiceChannelRepository();
            const serviceCount = await serviceChannelRepo.countActive();
            checks.services = {
                status: 'healthy',
                message: `Found ${serviceCount} active services`,
                count: serviceCount
            };
        }
        catch (error) {
            checks.services = {
                status: 'degraded',
                message: 'Service count check failed, but service is still operational',
                error: error instanceof Error ? error.message : 'Unknown error'
            };
            logger_1.default.warn('Service count check failed:', error);
            // Don't fail overall health for this
        }
        const health = {
            status: overallStatus,
            service: 'core-logistics',
            version: '1.0.0',
            timestamp: new Date().toISOString(),
            checks
        };
        res.status(statusCode).json(health);
    }
    catch (error) {
        logger_1.default.error('Health check failed:', error);
        res.status(503).json({
            status: 'unhealthy',
            service: 'core-logistics',
            version: '1.0.0',
            timestamp: new Date().toISOString(),
            error: 'Health check failed',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
exports.default = router;
//# sourceMappingURL=health.routes.js.map