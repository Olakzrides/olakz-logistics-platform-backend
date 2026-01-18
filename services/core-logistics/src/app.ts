import dotenv from 'dotenv';
dotenv.config();

import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import 'express-async-errors';
import config from './config';
import logger from './utils/logger';
import ResponseUtil from './utils/response';
import { AppError } from './utils/errors';

// Routes
import storeRoutes from './routes/store.routes';
import servicesRoutes from './routes/services.routes';
import healthRoutes from './routes/health.routes';

const app: Application = express();

// Trust proxy
app.set('trust proxy', 1);

// Security
app.use(helmet());
app.use(
  cors({
    origin: config.cors.allowedOrigins,
    credentials: true,
  })
);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
app.use((req, _res, next) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

// Root endpoint
app.get('/', (_req: Request, res: Response) => {
  res.json({
    service: 'Core Logistics Service',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/health',
      storeInit: 'GET /api/store/init',
      selectService: 'POST /api/services/select',
      serviceContext: 'GET /api/services/context',
    },
  });
});

// Health check
app.use('/health', healthRoutes);

// API Routes
app.use('/api/store', storeRoutes);
app.use('/api/services', servicesRoutes);

// 404 handler
app.use((req: Request, res: Response) => {
  ResponseUtil.error(res, `Route ${req.originalUrl} not found`, 404);
});

// Global error handler
app.use((err: Error | AppError, req: Request, res: Response, _next: NextFunction) => {
  logger.error('Error:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  if (err instanceof AppError) {
    return ResponseUtil.error(res, err.message, err.statusCode, err.code);
  }

  // Joi validation errors
  if (err.name === 'ValidationError') {
    return ResponseUtil.error(res, 'Validation error', 400, 'VALIDATION_ERROR', err);
  }

  // Default error
  return ResponseUtil.error(
    res,
    config.env === 'production' ? 'Internal server error' : err.message,
    500
  );
});

export default app;
