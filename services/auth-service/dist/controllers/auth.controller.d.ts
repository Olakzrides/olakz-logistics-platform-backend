import { Request, Response, NextFunction } from 'express';
declare class AuthController {
    /**
     * Register new user
     */
    register(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * Verify email with OTP
     */
    verifyEmail(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * Resend OTP
     */
    resendOTP(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * Login user
     */
    login(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * Refresh access token
     */
    refresh(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * Logout user
     */
    logout(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * Forgot password - send OTP
     */
    forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * Reset password with OTP
     */
    resetPassword(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * Google OAuth - Get auth URL
     */
    googleAuth(_req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * Google OAuth - Handle callback
     */
    googleCallback(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * Google OAuth - Verify token (for mobile apps)
     */
    googleVerify(req: Request, res: Response, next: NextFunction): Promise<void>;
}
declare const _default: AuthController;
export default _default;
