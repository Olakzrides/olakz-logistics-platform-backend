import { Application } from 'express';
import { createProxyMiddleware, Options } from 'http-proxy-middleware';
import config from '../config';
import logger from '../utils/logger';
import ResponseUtil from '../utils/response';
import { authRateLimiter } from '../middleware/rate-limit.middleware';

// Proxy options factory
const createProxyOptions = (target: string, pathRewrite?: any): Options => ({
  target,
  changeOrigin: true,
  pathRewrite,
  logLevel: config.env === 'development' ? 'debug' : 'warn',
  
  // Handle errors
  onError: (err, req, res) => {
    logger.error('Proxy error:', {
      error: err.message,
      target,
      path: req.url,
      method: req.method,
    });

    const response = res as any;
    const nodeError = err as NodeJS.ErrnoException;
    if (!response.headersSent) {
      if (nodeError.code === 'ECONNREFUSED') {
        ResponseUtil.serviceUnavailable(
          response,
          target.includes('3003') ? 'Auth' :
          target.includes('3001') ? 'Logistics' : 'Payment',
          'Service is not reachable. Please try again later.'
        );
      } else if (nodeError.code === 'ETIMEDOUT' || nodeError.code === 'ESOCKETTIMEDOUT') {
        ResponseUtil.error(
          response,
          'Request timeout',
          504,
          'GATEWAY_TIMEOUT',
          'The backend service took too long to respond'
        );
      } else {
        ResponseUtil.error(
          response,
          'Gateway error',
          502,
          'BAD_GATEWAY',
          config.env === 'development' ? err.message : undefined
        );
      }
    }
  },

  // Add custom headers
  onProxyReq: (proxyReq, req: any) => {
    // Forward user information if available (from auth middleware)
    if (req.user) {
      proxyReq.setHeader('X-User-Id', req.user.id);
      proxyReq.setHeader('X-User-Role', req.user.role);
    }

    // Log proxied request
    logger.debug('Proxying request:', {
      method: req.method,
      path: req.url,
      target,
    });
  },

  // Log response
  onProxyRes: (proxyRes, req, _res) => {
    logger.debug('Proxy response:', {
      statusCode: proxyRes.statusCode,
      path: req.url,
      target,
    });
  },

  // Timeout settings
  proxyTimeout: config.services.auth.timeout,
  timeout: config.services.auth.timeout,
});

/**
 * Setup all proxy routes
 */
export function setupRoutes(app: Application): void {
  // Auth Service routes (with stricter rate limiting)
  app.use(
    '/api/auth',
    authRateLimiter,
    createProxyMiddleware(createProxyOptions(config.services.auth.url))
  );

  // Logistics Service routes
  app.use(
    '/api/deliveries',
    createProxyMiddleware(createProxyOptions(config.services.logistics.url))
  );

  app.use(
    '/api/riders',
    createProxyMiddleware(createProxyOptions(config.services.logistics.url))
  );

  app.use(
    '/api/tracking',
    createProxyMiddleware(createProxyOptions(config.services.logistics.url))
  );

  app.use(
    '/api/pricing',
    createProxyMiddleware(createProxyOptions(config.services.logistics.url))
  );

  // Payment Service routes
  app.use(
    '/api/payments',
    createProxyMiddleware(createProxyOptions(config.services.payment.url))
  );

  logger.info('All proxy routes configured successfully');
}