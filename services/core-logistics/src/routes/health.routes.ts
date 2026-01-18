import { Router, Request, Response } from 'express';
import { testConnection } from '../utils/supabase';
import { ServiceChannelRepository } from '../repositories/service-channel.repository';
import logger from '../utils/logger';

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  const checks: Record<string, any> = {};
  let overallStatus = 'healthy';
  let statusCode = 200;

  try {
    // Test database connection
    try {
      const dbHealthy = await testConnection();
      checks.database = {
        status: dbHealthy ? 'healthy' : 'unhealthy',
        message: dbHealthy ? 'Database connection successful' : 'Database connection failed'
      };
      if (!dbHealthy) {
        overallStatus = 'unhealthy';
        statusCode = 503;
      }
    } catch (error) {
      checks.database = {
        status: 'unhealthy',
        message: 'Database connection error',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      overallStatus = 'unhealthy';
      statusCode = 503;
      logger.error('Database health check failed:', error);
    }

    // Test service channels (optional - don't fail if this fails)
    try {
      const serviceChannelRepo = new ServiceChannelRepository();
      const serviceCount = await serviceChannelRepo.countActive();
      checks.services = {
        status: 'healthy',
        message: `Found ${serviceCount} active services`,
        count: serviceCount
      };
    } catch (error) {
      checks.services = {
        status: 'degraded',
        message: 'Service count check failed, but service is still operational',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      logger.warn('Service count check failed:', error);
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
  } catch (error) {
    logger.error('Health check failed:', error);
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

export default router;
