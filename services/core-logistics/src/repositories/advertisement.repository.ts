import { getSupabase } from '../utils/supabase';
import { Advertisement } from '../types/store.types';
import logger from '../utils/logger';

export class AdvertisementRepository {
  private supabase = getSupabase();

  async findActiveOrderedByRank(): Promise<Advertisement[]> {
    try {
      const { data, error } = await this.supabase
        .from('advertisements')
        .select('*')
        .eq('is_active', true)
        .order('metadata->adsRank', { ascending: true });

      if (error) {
        logger.error('Error fetching advertisements:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      logger.error('Repository error in findActiveOrderedByRank:', error);
      throw error;
    }
  }
}
