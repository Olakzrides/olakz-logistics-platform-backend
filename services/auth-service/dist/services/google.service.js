"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const google_auth_library_1 = require("google-auth-library");
const uuid_1 = require("uuid");
const config_1 = __importDefault(require("../config"));
const supabase_1 = __importDefault(require("../utils/supabase"));
const logger_1 = __importDefault(require("../utils/logger"));
const errors_1 = require("../utils/errors");
const token_service_1 = __importDefault(require("./token.service"));
class GoogleService {
    constructor() {
        this.client = new google_auth_library_1.OAuth2Client(config_1.default.google.clientId, config_1.default.google.clientSecret, config_1.default.google.redirectUri);
    }
    /**
     * Get Google OAuth URL (for server-side flow)
     */
    getAuthUrl() {
        const scopes = [
            'https://www.googleapis.com/auth/userinfo.email',
            'https://www.googleapis.com/auth/userinfo.profile',
        ];
        return this.client.generateAuthUrl({
            access_type: 'offline',
            scope: scopes,
            prompt: 'consent',
        });
    }
    /**
     * Handle Google OAuth callback (server-side flow)
     */
    async handleCallback(code) {
        try {
            // Exchange code for tokens
            const { tokens } = await this.client.getToken(code);
            this.client.setCredentials(tokens);
            // Get user info
            const userInfo = await this.getUserInfo(tokens.id_token);
            // Find or create user
            return await this.findOrCreateUser(userInfo);
        }
        catch (error) {
            logger_1.default.error('Google OAuth callback error:', error);
            throw new errors_1.UnauthorizedError('Failed to authenticate with Google');
        }
    }
    /**
     * Verify Google token (client-side flow - for mobile)
     */
    async verifyGoogleToken(idToken) {
        try {
            const ticket = await this.client.verifyIdToken({
                idToken,
                audience: config_1.default.google.clientId,
            });
            const payload = ticket.getPayload();
            if (!payload) {
                throw new errors_1.UnauthorizedError('Invalid Google token');
            }
            const userInfo = {
                email: payload.email,
                given_name: payload.given_name || '',
                family_name: payload.family_name || '',
                picture: payload.picture,
                sub: payload.sub,
            };
            return await this.findOrCreateUser(userInfo);
        }
        catch (error) {
            logger_1.default.error('Google token verification error:', error);
            throw new errors_1.UnauthorizedError('Invalid Google token');
        }
    }
    /**
     * Get user info from Google token
     */
    async getUserInfo(idToken) {
        const ticket = await this.client.verifyIdToken({
            idToken,
            audience: config_1.default.google.clientId,
        });
        const payload = ticket.getPayload();
        if (!payload) {
            throw new errors_1.UnauthorizedError('Invalid Google token');
        }
        return {
            email: payload.email,
            given_name: payload.given_name || '',
            family_name: payload.family_name || '',
            picture: payload.picture,
            sub: payload.sub,
        };
    }
    /**
     * Find or create user from Google info
     */
    async findOrCreateUser(googleUser) {
        const { email, given_name, family_name, picture, sub } = googleUser;
        // Check if user exists by email or Google ID
        const { data: existingUser } = await supabase_1.default
            .from('users')
            .select('*')
            .or(`email.eq.${email.toLowerCase()},provider_id.eq.${sub}`)
            .single();
        let user;
        if (existingUser) {
            // User exists - update if needed
            user = existingUser;
            // Update Google ID if not set (user registered with email first)
            if (!user.provider_id && user.provider === 'emailpass') {
                await supabase_1.default
                    .from('users')
                    .update({
                    provider: 'google',
                    provider_id: sub,
                    avatar_url: picture,
                    email_verified: true, // Google verifies emails
                    updated_at: new Date().toISOString(),
                })
                    .eq('id', user.id);
            }
            // Update last login
            await supabase_1.default
                .from('users')
                .update({ last_login_at: new Date().toISOString() })
                .eq('id', user.id);
            logger_1.default.info(`Existing user logged in with Google: ${email}`);
        }
        else {
            // Create new user
            const userId = (0, uuid_1.v4)();
            // Generate username from email or name
            const username = this.generateUsername(email, given_name);
            const { data: newUser, error: createError } = await supabase_1.default
                .from('users')
                .insert({
                id: userId,
                email: email.toLowerCase(),
                password_hash: '', // No password for OAuth users
                first_name: given_name,
                last_name: family_name,
                username,
                role: 'customer',
                provider: 'google',
                provider_id: sub,
                avatar_url: picture,
                email_verified: true, // Google verifies emails
                status: 'active',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            })
                .select()
                .single();
            if (createError) {
                logger_1.default.error('Error creating Google user:', createError);
                throw new Error('Failed to create user');
            }
            user = newUser;
            logger_1.default.info(`New user created with Google: ${email}`);
        }
        // Generate JWT tokens
        const tokens = await token_service_1.default.generateTokens(user.id, user.email, user.role);
        // Return user data
        const userData = {
            id: user.id,
            email: user.email,
            firstName: user.first_name,
            lastName: user.last_name,
            username: user.username,
            role: user.role,
            avatarUrl: user.avatar_url,
            emailVerified: user.email_verified,
        };
        return { user: userData, ...tokens };
    }
    /**
     * Generate username from email or name
     */
    generateUsername(email, firstName) {
        // Prefer a cleaned firstName if provided, otherwise use email prefix
        const base = firstName ? firstName.toLowerCase().replace(/\s+/g, '') : email.split('@')[0].toLowerCase();
        // Add random suffix to ensure uniqueness
        const randomSuffix = Math.random().toString(36).substring(2, 6);
        return `${base}_${randomSuffix}`;
    }
}
exports.default = new GoogleService();
//# sourceMappingURL=google.service.js.map