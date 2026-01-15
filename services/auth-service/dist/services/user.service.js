"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const config_1 = __importDefault(require("../config"));
const supabase_1 = __importDefault(require("../utils/supabase"));
const logger_1 = __importDefault(require("../utils/logger"));
const errors_1 = require("../utils/errors");
class UserService {
    /**
     * Get user by ID
     */
    async getUserById(userId) {
        const { data: user, error } = await supabase_1.default
            .from('users')
            .select('id, email, first_name, last_name, username, role, phone, avatar_url, email_verified, created_at')
            .eq('id', userId)
            .single();
        if (error || !user) {
            throw new errors_1.NotFoundError('User not found');
        }
        return {
            id: user.id,
            email: user.email,
            firstName: user.first_name,
            lastName: user.last_name,
            username: user.username,
            role: user.role,
            phone: user.phone,
            avatarUrl: user.avatar_url,
            emailVerified: user.email_verified,
            createdAt: user.created_at,
        };
    }
    /**
     * Update user profile
     */
    async updateProfile(userId, updates) {
        const allowedUpdates = ['first_name', 'last_name', 'username', 'phone', 'avatar_url'];
        const updateData = { updated_at: new Date().toISOString() };
        // Filter allowed updates
        Object.keys(updates).forEach((key) => {
            if (allowedUpdates.includes(key)) {
                updateData[key] = updates[key];
            }
        });
        // Check if username is already taken
        if (updates.username) {
            const { data: existingUser } = await supabase_1.default
                .from('users')
                .select('id')
                .eq('username', updates.username)
                .neq('id', userId)
                .single();
            if (existingUser) {
                throw new errors_1.ConflictError('Username is already taken');
            }
        }
        const { data: user, error } = await supabase_1.default
            .from('users')
            .update(updateData)
            .eq('id', userId)
            .select()
            .single();
        if (error) {
            logger_1.default.error('Error updating user profile:', error);
            throw new Error('Failed to update profile');
        }
        logger_1.default.info(`Profile updated for user: ${userId}`);
        return this.formatUserData(user);
    }
    /**
     * Update user role
     */
    async updateRole(userId, role) {
        const { data: user, error } = await supabase_1.default
            .from('users')
            .update({
            role,
            updated_at: new Date().toISOString(),
        })
            .eq('id', userId)
            .select()
            .single();
        if (error) {
            logger_1.default.error('Error updating user role:', error);
            throw new Error('Failed to update role');
        }
        logger_1.default.info(`Role updated to ${role} for user: ${userId}`);
        return this.formatUserData(user);
    }
    /**
     * Change password
     */
    async changePassword(userId, currentPassword, newPassword) {
        // Get user
        const { data: user, error } = await supabase_1.default
            .from('users')
            .select('password_hash, provider')
            .eq('id', userId)
            .single();
        if (error || !user) {
            throw new errors_1.NotFoundError('User not found');
        }
        // Check if user uses password authentication
        if (user.provider !== 'emailpass') {
            throw new errors_1.ValidationError('Password change is not available for OAuth accounts');
        }
        // Verify current password
        const isPasswordValid = await bcryptjs_1.default.compare(currentPassword, user.password_hash);
        if (!isPasswordValid) {
            throw new errors_1.ValidationError('Current password is incorrect');
        }
        // Hash new password
        const passwordHash = await bcryptjs_1.default.hash(newPassword, config_1.default.security.bcryptRounds);
        // Update password
        const { error: updateError } = await supabase_1.default
            .from('users')
            .update({
            password_hash: passwordHash,
            updated_at: new Date().toISOString(),
        })
            .eq('id', userId);
        if (updateError) {
            logger_1.default.error('Error changing password:', updateError);
            throw new Error('Failed to change password');
        }
        logger_1.default.info(`Password changed for user: ${userId}`);
    }
    /**
     * Format user data for response
     */
    formatUserData(user) {
        return {
            id: user.id,
            email: user.email,
            firstName: user.first_name,
            lastName: user.last_name,
            username: user.username,
            role: user.role,
            phone: user.phone,
            avatarUrl: user.avatar_url,
            emailVerified: user.email_verified,
            createdAt: user.created_at,
        };
    }
}
exports.default = new UserService();
//# sourceMappingURL=user.service.js.map