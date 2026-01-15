import { getSupabase } from '../utils/supabase';
import { ServiceAnalytic } from '../types/store.types';
import logger from '../utils/logger';

export class AnalyticsRepository {
  private supabase = getSupabase();

  async create(analyticData: {
    user_id?: string;
    service_channel_id: string;
    action_type: string;
    metadata: Record<string, any>;
  }): Promise<ServiceAnalytic> {
    try {
      const { data, error } = await this.supabase
        .from('service_analytics')
        .insert(analyticData)
        .select()
        .single();

      if (error) {
        logger.error('Error creating analytics record:', error);
        throw error;
      }

      return data;
    } catch (error) {
      logger.error('Repository error in create analytics:', error);
      throw error;
    }
  }

  async getUserServiceHistory(userId: string, limit: number = 50): Promise<ServiceAnalytic[]> {
    try {
      const { data, error } = await this.supabase
        .from('service_analytics')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        logger.error('Error fetching user service history:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      logger.error('Repository error in getUserServiceHistory:', error);
      throw error;
    }
  }
}
