interface RegisterData {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
}
interface LoginData {
    email: string;
    password: string;
}
declare class AuthService {
    /**
     * Register new user
     */
    register(data: RegisterData): Promise<{
        userId: string;
        email: string;
    }>;
    /**
     * Verify email with OTP
     */
    verifyEmail(email: string, otp: string): Promise<void>;
    /**
     * Resend OTP
     */
    resendOTP(email: string): Promise<void>;
    /**
     * Login user
     */
    login(data: LoginData, ipAddress: string): Promise<any>;
    /**
     * Logout user
     */
    logout(refreshToken: string): Promise<void>;
    /**
     * Request password reset
     */
    forgotPassword(email: string): Promise<void>;
    /**
     * Reset password with OTP
     */
    resetPassword(email: string, otp: string, newPassword: string): Promise<void>;
    /**
     * Check login attempts and rate limiting
     */
    private checkLoginAttempts;
    /**
     * Track login attempt
     */
    private trackLoginAttempt;
    /**
     * Cleanup old login attempts
     */
    cleanupOldLoginAttempts(): Promise<void>;
}
declare const _default: AuthService;
export default _default;
