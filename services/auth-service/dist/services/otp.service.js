"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const crypto_1 = __importDefault(require("crypto"));
const uuid_1 = require("uuid");
const config_1 = __importDefault(require("../config"));
const supabase_1 = __importDefault(require("../utils/supabase"));
const logger_1 = __importDefault(require("../utils/logger"));
const errors_1 = require("../utils/errors");
class OTPService {
    /**
     * Generate OTP code
     */
    generateOTP() {
        const digits = '0123456789';
        let otp = '';
        for (let i = 0; i < config_1.default.otp.length; i++) {
            otp += digits[crypto_1.default.randomInt(0, digits.length)];
        }
        return otp;
    }
    /**
     * Create and store OTP for user
     */
    async createOTP(userId, type) {
        // Check resend rate limit
        await this.checkResendLimit(userId);
        // Invalidate any existing OTPs of same type for this user
        await this.invalidateExistingOTPs(userId, type);
        // Generate new OTP
        const otpCode = this.generateOTP();
        const expiresAt = new Date();
        expiresAt.setMinutes(expiresAt.getMinutes() + config_1.default.otp.expiryMinutes);
        // Store OTP in database
        const { error } = await supabase_1.default.from('otp_verifications').insert({
            id: (0, uuid_1.v4)(),
            user_id: userId,
            type,
            code: otpCode,
            expires_at: expiresAt.toISOString(),
            verified: false,
            attempts: 0,
        });
        if (error) {
            logger_1.default.error('Error creating OTP:', error);
            throw new Error('Failed to create OTP');
        }
        // Track resend
        await this.trackResend(userId);
        logger_1.default.info(`OTP created for user ${userId}, type: ${type}`);
        return otpCode;
    }
    /**
     * Verify OTP
     */
    async verifyOTP(userId, otpCode, type) {
        // Get OTP from database
        const { data: otp, error } = await supabase_1.default
            .from('otp_verifications')
            .select('*')
            .eq('user_id', userId)
            .eq('type', type)
            .eq('verified', false)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();
        if (error || !otp) {
            throw new errors_1.ValidationError('Invalid or expired OTP');
        }
        // Check if OTP expired
        if (new Date(otp.expires_at) < new Date()) {
            throw new errors_1.ValidationError('OTP has expired. Please request a new one.');
        }
        // Check if max attempts exceeded
        if (otp.attempts >= config_1.default.otp.maxAttempts) {
            throw new errors_1.ValidationError('Maximum OTP attempts exceeded. Please request a new OTP.');
        }
        // Verify OTP code
        if (otp.code !== otpCode) {
            // Increment attempts
            await supabase_1.default
                .from('otp_verifications')
                .update({ attempts: otp.attempts + 1 })
                .eq('id', otp.id);
            const remainingAttempts = config_1.default.otp.maxAttempts - (otp.attempts + 1);
            if (remainingAttempts <= 0) {
                throw new errors_1.ValidationError('Invalid OTP. Maximum attempts exceeded. Please request a new OTP.');
            }
            throw new errors_1.ValidationError(`Invalid OTP. ${remainingAttempts} attempt${remainingAttempts > 1 ? 's' : ''} remaining.`);
        }
        // Mark OTP as verified
        await supabase_1.default
            .from('otp_verifications')
            .update({ verified: true })
            .eq('id', otp.id);
        logger_1.default.info(`OTP verified successfully for user ${userId}`);
        return true;
    }
    /**
     * Check if user has exceeded resend limit
     */
    async checkResendLimit(userId) {
        const oneHourAgo = new Date();
        oneHourAgo.setHours(oneHourAgo.getHours() - 1);
        const { data: resends, error } = await supabase_1.default
            .from('otp_resend_tracking')
            .select('*')
            .eq('email', userId) // Using email field for user tracking
            .gte('resent_at', oneHourAgo.toISOString());
        if (error) {
            logger_1.default.error('Error checking resend limit:', error);
            return; // Don't block on error
        }
        if (resends && resends.length >= config_1.default.otp.resendLimitPerHour) {
            throw new errors_1.TooManyRequestsError(`You can only request ${config_1.default.otp.resendLimitPerHour} OTPs per hour. Please try again later.`);
        }
    }
    /**
     * Track OTP resend
     */
    async trackResend(userId) {
        await supabase_1.default.from('otp_resend_tracking').insert({
            email: userId,
            resent_at: new Date().toISOString(),
        });
    }
    /**
     * Invalidate existing OTPs
     */
    async invalidateExistingOTPs(userId, type) {
        await supabase_1.default
            .from('otp_verifications')
            .update({ verified: true }) // Mark as verified to invalidate
            .eq('user_id', userId)
            .eq('type', type)
            .eq('verified', false);
    }
    /**
     * Get user by email (helper for email-based OTP)
     */
    async getUserByEmail(email) {
        const { data: user, error } = await supabase_1.default
            .from('users')
            .select('id, email, first_name')
            .eq('email', email)
            .single();
        if (error || !user) {
            return null;
        }
        return user;
    }
    /**
     * Cleanup expired OTPs
     */
    async cleanupExpiredOTPs() {
        const oneDayAgo = new Date();
        oneDayAgo.setDate(oneDayAgo.getDate() - 1);
        const { error } = await supabase_1.default
            .from('otp_verifications')
            .delete()
            .lt('expires_at', oneDayAgo.toISOString());
        if (error) {
            logger_1.default.error('Error cleaning up expired OTPs:', error);
        }
        else {
            logger_1.default.info('Cleaned up expired OTPs');
        }
    }
}
exports.default = new OTPService();
//# sourceMappingURL=otp.service.js.map