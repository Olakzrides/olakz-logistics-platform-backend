"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const auth_service_1 = __importDefault(require("../services/auth.service"));
const token_service_1 = __importDefault(require("../services/token.service"));
const google_service_1 = __importDefault(require("../services/google.service"));
const response_1 = __importDefault(require("../utils/response"));
class AuthController {
    /**
     * Register new user
     */
    async register(req, res, next) {
        try {
            const result = await auth_service_1.default.register(req.body);
            response_1.default.success(res, result, 'Registration successful. Please check your email for verification code.', 201);
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Verify email with OTP
     */
    async verifyEmail(req, res, next) {
        try {
            await auth_service_1.default.verifyEmail(req.body.email, req.body.otp);
            response_1.default.success(res, null, 'Email verified successfully. You can now login.');
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Resend OTP
     */
    async resendOTP(req, res, next) {
        try {
            await auth_service_1.default.resendOTP(req.body.email);
            response_1.default.success(res, null, 'Verification code sent successfully. Please check your email.');
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Login user
     */
    async login(req, res, next) {
        try {
            const ipAddress = (req.ip || req.socket.remoteAddress || '').replace('::ffff:', '');
            const result = await auth_service_1.default.login(req.body, ipAddress);
            response_1.default.success(res, result, 'Login successful');
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Refresh access token
     */
    async refresh(req, res, next) {
        try {
            const tokens = await token_service_1.default.refreshAccessToken(req.body.refreshToken);
            response_1.default.success(res, tokens, 'Token refreshed successfully');
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Logout user
     */
    async logout(req, res, next) {
        try {
            await auth_service_1.default.logout(req.body.refreshToken);
            response_1.default.success(res, null, 'Logout successful');
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Forgot password - send OTP
     */
    async forgotPassword(req, res, next) {
        try {
            await auth_service_1.default.forgotPassword(req.body.email);
            response_1.default.success(res, null, 'If an account exists with this email, a password reset code has been sent.');
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Reset password with OTP
     */
    async resetPassword(req, res, next) {
        try {
            await auth_service_1.default.resetPassword(req.body.email, req.body.otp, req.body.newPassword);
            response_1.default.success(res, null, 'Password reset successful. Please login with your new password.');
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Google OAuth - Get auth URL
     */
    async googleAuth(_req, res, next) {
        try {
            const authUrl = google_service_1.default.getAuthUrl();
            res.redirect(authUrl);
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Google OAuth - Handle callback
     */
    async googleCallback(req, res, next) {
        try {
            const { code } = req.query;
            if (!code || typeof code !== 'string') {
                throw new Error('Authorization code not provided');
            }
            const result = await google_service_1.default.handleCallback(code);
            // Redirect to frontend with tokens (in production, use proper redirect)
            const redirectUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/callback?accessToken=${result.accessToken}&refreshToken=${result.refreshToken}`;
            res.redirect(redirectUrl);
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Google OAuth - Verify token (for mobile apps)
     */
    async googleVerify(req, res, next) {
        try {
            const result = await google_service_1.default.verifyGoogleToken(req.body.googleToken);
            response_1.default.success(res, result, 'Google authentication successful');
        }
        catch (error) {
            next(error);
        }
    }
}
exports.default = new AuthController();
//# sourceMappingURL=auth.controller.js.map