import { getSupabase } from '../utils/supabase';
import { ServiceChannel } from '../types/store.types';
import logger from '../utils/logger';

export class ServiceChannelRepository {
  private supabase = getSupabase();

  async findActiveWithProducts(): Promise<ServiceChannel[]> {
    try {
      const { data, error } = await this.supabase
        .from('service_channels')
        .select(`
          *,
          product:products(*)
        `)
        .eq('is_active', true)
        .order('metadata->rank', { ascending: true });

      if (error) {
        logger.error('Error fetching service channels:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      logger.error('Repository error in findActiveWithProducts:', error);
      throw error;
    }
  }

  async findByName(name: string): Promise<ServiceChannel | null> {
    try {
      const { data, error } = await this.supabase
        .from('service_channels')
        .select('*')
        .eq('name', name)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        logger.error('Error fetching service channel by name:', error);
        throw error;
      }

      return data;
    } catch (error) {
      logger.error('Repository error in findByName:', error);
      throw error;
    }
  }

  async countActive(): Promise<number> {
    try {
      const { count, error } = await this.supabase
        .from('service_channels')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

      if (error) {
        logger.error('Error counting active service channels:', error);
        throw error;
      }

      return count || 0;
    } catch (error) {
      logger.error('Repository error in countActive:', error);
      throw error;
    }
  }
}
