"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const uuid_1 = require("uuid");
const config_1 = __importDefault(require("../config"));
const supabase_1 = __importDefault(require("../utils/supabase"));
const logger_1 = __importDefault(require("../utils/logger"));
const errors_1 = require("../utils/errors");
const token_service_1 = __importDefault(require("./token.service"));
const otp_service_1 = __importDefault(require("./otp.service"));
const email_service_1 = __importDefault(require("./email.service"));
class AuthService {
    /**
     * Register new user
     */
    async register(data) {
        const { firstName, lastName, email, password } = data;
        // Check if email already exists
        const { data: existingUser } = await supabase_1.default
            .from('users')
            .select('id, email')
            .eq('email', email.toLowerCase())
            .single();
        if (existingUser) {
            throw new errors_1.ConflictError('An account with this email already exists. Please login instead.');
        }
        // Hash password
        const passwordHash = await bcryptjs_1.default.hash(password, config_1.default.security.bcryptRounds);
        // Create user
        const userId = (0, uuid_1.v4)();
        const { error: createError } = await supabase_1.default.from('users').insert({
            id: userId,
            email: email.toLowerCase(),
            password_hash: passwordHash,
            first_name: firstName,
            last_name: lastName,
            role: 'customer',
            provider: 'emailpass',
            email_verified: false,
            status: 'active',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        });
        if (createError) {
            logger_1.default.error('Error creating user:', createError);
            throw new Error('Failed to create user');
        }
        // Generate and send OTP
        const otp = await otp_service_1.default.createOTP(userId, 'email_verification');
        await email_service_1.default.sendOTPEmail(email, firstName, otp, 'verification');
        logger_1.default.info(`User registered successfully: ${email}`);
        return { userId, email };
    }
    /**
     * Verify email with OTP
     */
    async verifyEmail(email, otp) {
        // Get user
        const { data: user, error } = await supabase_1.default
            .from('users')
            .select('id, first_name, email_verified')
            .eq('email', email.toLowerCase())
            .single();
        if (error || !user) {
            throw new errors_1.NotFoundError('User not found');
        }
        if (user.email_verified) {
            throw new errors_1.ValidationError('Email is already verified');
        }
        // Verify OTP
        await otp_service_1.default.verifyOTP(user.id, otp, 'email_verification');
        // Update user as verified
        const { error: updateError } = await supabase_1.default
            .from('users')
            .update({
            email_verified: true,
            updated_at: new Date().toISOString(),
        })
            .eq('id', user.id);
        if (updateError) {
            logger_1.default.error('Error updating user verification status:', updateError);
            throw new Error('Failed to verify email');
        }
        // Send welcome email
        try {
            await email_service_1.default.sendWelcomeEmail(email, user.first_name);
        }
        catch (error) {
            logger_1.default.warn('Failed to send welcome email:', error);
            // Don't fail verification if welcome email fails
        }
        logger_1.default.info(`Email verified successfully: ${email}`);
    }
    /**
     * Resend OTP
     */
    async resendOTP(email) {
        // Get user
        const { data: user, error } = await supabase_1.default
            .from('users')
            .select('id, first_name, email_verified')
            .eq('email', email.toLowerCase())
            .single();
        if (error || !user) {
            throw new errors_1.NotFoundError('User not found');
        }
        if (user.email_verified) {
            throw new errors_1.ValidationError('Email is already verified');
        }
        // Generate and send new OTP
        const otp = await otp_service_1.default.createOTP(user.id, 'email_verification');
        await email_service_1.default.sendOTPEmail(email, user.first_name, otp, 'verification');
        logger_1.default.info(`OTP resent to: ${email}`);
    }
    /**
     * Login user
     */
    async login(data, ipAddress) {
        const { email, password } = data;
        // Check login attempts
        await this.checkLoginAttempts(email, ipAddress);
        // Get user
        const { data: user, error } = await supabase_1.default
            .from('users')
            .select('*')
            .eq('email', email.toLowerCase())
            .single();
        if (error || !user) {
            await this.trackLoginAttempt(email, ipAddress, false);
            throw new errors_1.UnauthorizedError('Invalid email or password');
        }
        // Check if email is verified
        if (!user.email_verified) {
            throw new errors_1.UnauthorizedError('Please verify your email before logging in');
        }
        // Check account status
        if (user.status !== 'active') {
            throw new errors_1.UnauthorizedError('Your account has been disabled. Please contact support.');
        }
        // Verify password (only for emailpass provider)
        if (user.provider === 'emailpass') {
            const isPasswordValid = await bcryptjs_1.default.compare(password, user.password_hash);
            if (!isPasswordValid) {
                await this.trackLoginAttempt(email, ipAddress, false);
                throw new errors_1.UnauthorizedError('Invalid email or password');
            }
        }
        // Track successful login
        await this.trackLoginAttempt(email, ipAddress, true);
        // Update last login
        await supabase_1.default
            .from('users')
            .update({ last_login_at: new Date().toISOString() })
            .eq('id', user.id);
        // Generate tokens
        const tokens = await token_service_1.default.generateTokens(user.id, user.email, user.role);
        // Return user data (exclude sensitive fields)
        const userData = {
            id: user.id,
            email: user.email,
            firstName: user.first_name,
            lastName: user.last_name,
            username: user.username,
            role: user.role,
            phone: user.phone,
            avatarUrl: user.avatar_url,
            emailVerified: user.email_verified,
        };
        logger_1.default.info(`User logged in successfully: ${email}`);
        return { user: userData, ...tokens };
    }
    /**
     * Logout user
     */
    async logout(refreshToken) {
        await token_service_1.default.revokeRefreshToken(refreshToken);
        logger_1.default.info('User logged out successfully');
    }
    /**
     * Request password reset
     */
    async forgotPassword(email) {
        // Get user
        const { data: user, error } = await supabase_1.default
            .from('users')
            .select('id, first_name, provider')
            .eq('email', email.toLowerCase())
            .single();
        if (error || !user) {
            // Don't reveal if user exists (security best practice)
            // But still return success message
            logger_1.default.info(`Password reset requested for non-existent email: ${email}`);
            return;
        }
        // Check if user uses OAuth
        if (user.provider !== 'emailpass') {
            throw new errors_1.ValidationError('Password reset is not available for OAuth accounts');
        }
        // Generate and send OTP
        const otp = await otp_service_1.default.createOTP(user.id, 'password_reset');
        await email_service_1.default.sendOTPEmail(email, user.first_name, otp, 'password_reset');
        logger_1.default.info(`Password reset OTP sent to: ${email}`);
    }
    /**
     * Reset password with OTP
     */
    async resetPassword(email, otp, newPassword) {
        // Get user
        const { data: user, error } = await supabase_1.default
            .from('users')
            .select('id, provider')
            .eq('email', email.toLowerCase())
            .single();
        if (error || !user) {
            throw new errors_1.NotFoundError('User not found');
        }
        if (user.provider !== 'emailpass') {
            throw new errors_1.ValidationError('Password reset is not available for OAuth accounts');
        }
        // Verify OTP
        await otp_service_1.default.verifyOTP(user.id, otp, 'password_reset');
        // Hash new password
        const passwordHash = await bcryptjs_1.default.hash(newPassword, config_1.default.security.bcryptRounds);
        // Update password
        const { error: updateError } = await supabase_1.default
            .from('users')
            .update({
            password_hash: passwordHash,
            updated_at: new Date().toISOString(),
        })
            .eq('id', user.id);
        if (updateError) {
            logger_1.default.error('Error updating password:', updateError);
            throw new Error('Failed to reset password');
        }
        // Revoke all existing tokens (logout from all devices)
        await token_service_1.default.revokeAllUserTokens(user.id);
        logger_1.default.info(`Password reset successfully for user: ${email}`);
    }
    /**
     * Check login attempts and rate limiting
     */
    async checkLoginAttempts(email, _ipAddress) {
        const blockDuration = config_1.default.rateLimit.loginBlockDurationMinutes;
        const blockUntil = new Date();
        blockUntil.setMinutes(blockUntil.getMinutes() - blockDuration);
        // Get recent failed attempts
        const { data: attempts, error } = await supabase_1.default
            .from('login_attempts')
            .select('*')
            .eq('email', email.toLowerCase())
            .eq('success', false)
            .gte('attempted_at', blockUntil.toISOString())
            .order('attempted_at', { ascending: false });
        if (error) {
            logger_1.default.error('Error checking login attempts:', error);
            return; // Don't block on error
        }
        if (attempts && attempts.length >= config_1.default.rateLimit.loginFailureLimit) {
            const lastAttempt = new Date(attempts[0].attempted_at);
            const minutesLeft = Math.ceil((blockDuration - (Date.now() - lastAttempt.getTime()) / 60000));
            throw new errors_1.TooManyRequestsError(`Too many failed login attempts. Please try again in ${minutesLeft} minute${minutesLeft > 1 ? 's' : ''}.`);
        }
    }
    /**
     * Track login attempt
     */
    async trackLoginAttempt(email, ipAddress, success) {
        await supabase_1.default.from('login_attempts').insert({
            email: email.toLowerCase(),
            ip_address: ipAddress,
            success,
            attempted_at: new Date().toISOString(),
        });
    }
    /**
     * Cleanup old login attempts
     */
    async cleanupOldLoginAttempts() {
        const oneDayAgo = new Date();
        oneDayAgo.setDate(oneDayAgo.getDate() - 1);
        const { error } = await supabase_1.default
            .from('login_attempts')
            .delete()
            .lt('attempted_at', oneDayAgo.toISOString());
        if (error) {
            logger_1.default.error('Error cleaning up login attempts:', error);
        }
        else {
            logger_1.default.info('Cleaned up old login attempts');
        }
    }
}
exports.default = new AuthService();
//# sourceMappingURL=auth.service.js.map