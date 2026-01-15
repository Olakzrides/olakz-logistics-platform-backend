import { Request, Response, NextFunction } from 'express';
import { Schema } from 'joi';
export declare const validate: (schema: Schema) => (req: Request, res: Response, next: NextFunction) => void | Response<any, Record<string, any>>;
//# sourceMappingURL=validation.middleware.d.ts.map