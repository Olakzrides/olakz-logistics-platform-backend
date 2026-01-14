import { Request, Response, NextFunction } from 'express';
import ResponseUtil from '../utils/response';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: string;
      };
    }
  }
}

export const optionalAuth = (req: Request, _res: Response, next: NextFunction) => {
  const skipAuth = req.headers['x-skip-auth-validation'];
  
  if (skipAuth) {
    return next();
  }

  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return next();
  }

  // TODO: Validate JWT token with auth-service
  req.user = {
    id: '00000000-0000-0000-0000-000000000001',
    email: 'user@example.com',
    role: 'customer',
  };

  next();
};

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return ResponseUtil.error(res, 'Authorization header required', 401);
  }

  // TODO: Validate JWT token with auth-service
  req.user = {
    id: '00000000-0000-0000-0000-000000000001',
    email: 'user@example.com',
    role: 'customer',
  };

  return next();
};
