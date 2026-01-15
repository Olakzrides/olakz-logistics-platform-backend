import { Request, Response, NextFunction } from 'express';
declare class UserController {
    /**
     * Get current user
     */
    getCurrentUser(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * Update user profile
     */
    updateProfile(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * Update user role
     */
    updateRole(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * Change password
     */
    changePassword(req: Request, res: Response, next: NextFunction): Promise<void>;
}
declare const _default: UserController;
export default _default;
