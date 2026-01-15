import { Router, Request, Response } from 'express';
import { testConnection } from '../utils/supabase';
import { ServiceChannelRepository } from '../repositories/service-channel.repository';

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  try {
    const dbHealthy = await testConnection();
    const serviceChannelRepo = new ServiceChannelRepository();
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
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Health check failed',
    });
  }
});

export default router;
