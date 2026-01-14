import { getSupabase } from '../utils/supabase';
import { UserServiceSession } from '../types/store.types';
import logger from '../utils/logger';

export class UserSessionRepository {
  private supabase = getSupabase();

  async create(sessionData: {
    user_id: string;
    service_channel_id: string;
    session_data: Record<string, any>;
    is_active: boolean;
  }): Promise<UserServiceSession> {
    try {
      const { data, error } = await this.supabase
        .from('user_service_sessions')
        .insert(sessionData)
        .select()
        .single();

      if (error) {
        logger.error('Error creating user session:', error);
        throw error;
      }

      return data;
    } catch (error) {
      logger.error('Repository error in create:', error);
      throw error;
    }
  }

  async findActiveByUserId(userId: string): Promise<UserServiceSession | null> {
    try {
      const { data, error } = await this.supabase
        .from('user_service_sessions')
        .select(`
          *,
          service_channel:service_channels(*)
        `)
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('last_activity_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        logger.error('Error fetching active user session:', error);
        throw error;
      }

      return data;
    } catch (error) {
      logger.error('Repository error in findActiveByUserId:', error);
      throw error;
    }
  }

  async deactivateUserSessions(userId: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('user_service_sessions')
        .update({ is_active: false })
        .eq('user_id', userId)
        .eq('is_active', true);

      if (error) {
        logger.error('Error deactivating user sessions:', error);
        throw error;
      }
    } catch (error) {
      logger.error('Repository error in deactivateUserSessions:', error);
      throw error;
    }
  }

  async updateLastActivity(sessionId: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('user_service_sessions')
        .update({ last_activity_at: new Date().toISOString() })
        .eq('id', sessionId);

      if (error) {
        logger.error('Error updating session activity:', error);
        throw error;
      }
    } catch (error) {
      logger.error('Repository error in updateLastActivity:', error);
      throw error;
    }
  }
}
