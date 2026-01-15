declare class OTPService {
    /**
     * Generate OTP code
     */
    generateOTP(): string;
    /**
     * Create and store OTP for user
     */
    createOTP(userId: string, type: 'email_verification' | 'password_reset'): Promise<string>;
    /**
     * Verify OTP
     */
    verifyOTP(userId: string, otpCode: string, type: 'email_verification' | 'password_reset'): Promise<boolean>;
    /**
     * Check if user has exceeded resend limit
     */
    private checkResendLimit;
    /**
     * Track OTP resend
     */
    private trackResend;
    /**
     * Invalidate existing OTPs
     */
    private invalidateExistingOTPs;
    /**
     * Get user by email (helper for email-based OTP)
     */
    getUserByEmail(email: string): Promise<any>;
    /**
     * Cleanup expired OTPs
     */
    cleanupExpiredOTPs(): Promise<void>;
}
declare const _default: OTPService;
export default _default;
