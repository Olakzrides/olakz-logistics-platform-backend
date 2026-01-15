import { Request, Response, NextFunction } from 'express';
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
export declare const optionalAuth: (req: Request, _res: Response, next: NextFunction) => void;
export declare const requireAuth: (req: Request, res: Response, next: NextFunction) => void | Response<any, Record<string, any>>;
//# sourceMappingURL=auth.middleware.d.ts.map