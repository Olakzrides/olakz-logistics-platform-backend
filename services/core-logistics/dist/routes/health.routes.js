"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const supabase_1 = require("../utils/supabase");
const service_channel_repository_1 = require("../repositories/service-channel.repository");
const router = (0, express_1.Router)();
router.get('/', async (_req, res) => {
    try {
        const dbHealthy = await (0, supabase_1.testConnection)();
        const serviceChannelRepo = new service_channel_repository_1.ServiceChannelRepository();
        const serviceCount = await serviceChannelRepo.countActive();
        const health = {
            status: dbHealthy && serviceCount > 0 ? 'healthy' : 'unhealthy',
            timestamp: new Date().toISOString(),
            checks: {
                database: dbHealthy ? 'healthy' : 'unhealthy',
                services: serviceCount > 0 ? 'healthy' : 'unhealthy',
            },
            service_count: serviceCount,
        };
        const statusCode = health.status === 'healthy' ? 200 : 503;
        res.status(statusCode).json(health);
    }
    catch (error) {
        res.status(503).json({
            status: 'unhealthy',
            timestamp: new Date().toISOString(),
            error: 'Health check failed',
        });
    }
});
exports.default = router;
//# sourceMappingURL=health.routes.js.map