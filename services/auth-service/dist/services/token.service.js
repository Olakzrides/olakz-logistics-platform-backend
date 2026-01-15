"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto_1 = __importDefault(require("crypto"));
const config_1 = __importDefault(require("../config"));
const supabase_1 = __importDefault(require("../utils/supabase"));
const logger_1 = __importDefault(require("../utils/logger"));
const errors_1 = require("../utils/errors");
class TokenService {
    /**
     * Generate access and refresh tokens
     */
    async generateTokens(userId, email, role) {
        const payload = { userId, email, role };
        // Generate access token (short-lived)
        const accessToken = jsonwebtoken_1.default.sign(payload, config_1.default.jwt.secret, {
            expiresIn: config_1.default.jwt.accessTokenExpiry,
        });
        // Generate refresh token (long-lived)
        const refreshToken = jsonwebtoken_1.default.sign({ userId }, config_1.default.jwt.secret, {
            expiresIn: config_1.default.jwt.refreshTokenExpiry,
        });
        // Store refresh token in database
        await this.storeRefreshToken(userId, refreshToken);
        return { accessToken, refreshToken };
    }
    /**
     * Verify access token
     */
    verifyAccessToken(token) {
        try {
            const decoded = jsonwebtoken_1.default.verify(token, config_1.default.jwt.secret);
            return decoded;
        }
        catch (error) {
            if (error.name === 'TokenExpiredError') {
                throw new errors_1.UnauthorizedError('Access token expired');
            }
            throw new errors_1.UnauthorizedError('Invalid access token');
        }
    }
    /**
     * Verify refresh token and generate new tokens
     */
    async refreshAccessToken(refreshToken) {
        try {
            // Verify refresh token
            const decoded = jsonwebtoken_1.default.verify(refreshToken, config_1.default.jwt.secret);
            // Check if token exists in database and not revoked
            const tokenHash = this.hashToken(refreshToken);
            const { data: storedToken, error } = await supabase_1.default
                .from('refresh_tokens')
                .select('*')
                .eq('token_hash', tokenHash)
                .eq('user_id', decoded.userId)
                .eq('revoked', false)
                .single();
            if (error || !storedToken) {
                throw new errors_1.UnauthorizedError('Invalid refresh token');
            }
            // Check if token expired
            if (new Date(storedToken.expires_at) < new Date()) {
                await this.revokeRefreshToken(refreshToken);
                throw new errors_1.UnauthorizedError('Refresh token expired');
            }
            // Get user data
            const { data: user, error: userError } = await supabase_1.default
                .from('users')
                .select('id, email, role')
                .eq('id', decoded.userId)
                .single();
            if (userError || !user) {
                throw new errors_1.UnauthorizedError('User not found');
            }
            // Revoke old refresh token
            await this.revokeRefreshToken(refreshToken);
            // Generate new token pair
            return await this.generateTokens(user.id, user.email, user.role);
        }
        catch (error) {
            if (error instanceof errors_1.UnauthorizedError) {
                throw error;
            }
            if (error.name === 'TokenExpiredError') {
                throw new errors_1.UnauthorizedError('Refresh token expired');
            }
            throw new errors_1.UnauthorizedError('Invalid refresh token');
        }
    }
    /**
     * Store refresh token in database
     */
    async storeRefreshToken(userId, refreshToken) {
        const tokenHash = this.hashToken(refreshToken);
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now
        const { error } = await supabase_1.default.from('refresh_tokens').insert({
            user_id: userId,
            token_hash: tokenHash,
            expires_at: expiresAt.toISOString(),
            revoked: false,
        });
        if (error) {
            logger_1.default.error('Error storing refresh token:', error);
            throw new Error('Failed to store refresh token');
        }
    }
    /**
     * Revoke refresh token
     */
    async revokeRefreshToken(refreshToken) {
        const tokenHash = this.hashToken(refreshToken);
        const { error } = await supabase_1.default
            .from('refresh_tokens')
            .update({ revoked: true })
            .eq('token_hash', tokenHash);
        if (error) {
            logger_1.default.error('Error revoking refresh token:', error);
        }
    }
    /**
     * Revoke all user tokens (logout from all devices)
     */
    async revokeAllUserTokens(userId) {
        const { error } = await supabase_1.default
            .from('refresh_tokens')
            .update({ revoked: true })
            .eq('user_id', userId);
        if (error) {
            logger_1.default.error('Error revoking all user tokens:', error);
            throw new Error('Failed to revoke tokens');
        }
    }
    /**
     * Hash token for storage (don't store plain tokens)
     */
    hashToken(token) {
        return crypto_1.default.createHash('sha256').update(token).digest('hex');
    }
    /**
     * Cleanup expired tokens (call periodically)
     */
    async cleanupExpiredTokens() {
        const { error } = await supabase_1.default
            .from('refresh_tokens')
            .delete()
            .lt('expires_at', new Date().toISOString());
        if (error) {
            logger_1.default.error('Error cleaning up expired tokens:', error);
        }
        else {
            logger_1.default.info('Cleaned up expired refresh tokens');
        }
    }
}
exports.default = new TokenService();
//# sourceMappingURL=token.service.js.map