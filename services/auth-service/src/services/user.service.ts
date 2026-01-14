import bcrypt from 'bcryptjs';
import config from '../config';
import supabase from '../utils/supabase';
import logger from '../utils/logger';
import { NotFoundError, ValidationError, ConflictError } from '../utils/errors';

class UserService {
  /**
   * Get user by ID
   */
  async getUserById(userId: string): Promise<any> {
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, first_name, last_name, username, role, phone, avatar_url, email_verified, created_at')
      .eq('id', userId)
      .single();

    if (error || !user) {
      throw new NotFoundError('User not found');
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
  async updateProfile(userId: string, updates: any): Promise<any> {
    const allowedUpdates = ['first_name', 'last_name', 'username', 'phone', 'avatar_url'];
    const updateData: any = { updated_at: new Date().toISOString() };

    // Filter allowed updates
    Object.keys(updates).forEach((key) => {
      if (allowedUpdates.includes(key)) {
        updateData[key] = updates[key];
      }
    });

    // Check if username is already taken
    if (updates.username) {
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('username', updates.username)
        .neq('id', userId)
        .single();

      if (existingUser) {
        throw new ConflictError('Username is already taken');
      }
    }

    const { data: user, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      logger.error('Error updating user profile:', error);
      throw new Error('Failed to update profile');
    }

    logger.info(`Profile updated for user: ${userId}`);
    return this.formatUserData(user);
  }

  /**
   * Update user role
   */
  async updateRole(userId: string, role: 'customer' | 'rider'): Promise<any> {
    const { data: user, error } = await supabase
      .from('users')
      .update({
        role,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      logger.error('Error updating user role:', error);
      throw new Error('Failed to update role');
    }

    logger.info(`Role updated to ${role} for user: ${userId}`);
    return this.formatUserData(user);
  }

  /**
   * Change password
   */
  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    // Get user
    const { data: user, error } = await supabase
      .from('users')
      .select('password_hash, provider')
      .eq('id', userId)
      .single();

    if (error || !user) {
      throw new NotFoundError('User not found');
    }

    // Check if user uses password authentication
    if (user.provider !== 'emailpass') {
      throw new ValidationError('Password change is not available for OAuth accounts');
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isPasswordValid) {
      throw new ValidationError('Current password is incorrect');
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, config.security.bcryptRounds);

    // Update password
    const { error: updateError } = await supabase
      .from('users')
      .update({
        password_hash: passwordHash,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (updateError) {
      logger.error('Error changing password:', updateError);
      throw new Error('Failed to change password');
    }

    logger.info(`Password changed for user: ${userId}`);
  }

  /**
   * Format user data for response
   */
  private formatUserData(user: any): any {
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

export default new UserService();