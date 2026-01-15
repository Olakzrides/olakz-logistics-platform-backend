import { Request, Response, NextFunction } from 'express';
export interface AuthRequest extends Request {
    user?: {
        userId: string;
        email: string;
        role: string;
    };
}
/**
 * Verify JWT token from Authorization header
 */
export declare const authMiddleware: (req: AuthRequest, _res: Response, next: NextFunction) => Promise<void>;
/**
 * Validate request body/query/params with Joi
 */
export declare const validateRequest: (schema: any) => (req: Request, res: Response, next: NextFunction) => void;
