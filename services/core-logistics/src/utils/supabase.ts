import { createClient, SupabaseClient } from '@supabase/supabase-js';
import config from '../config';
import logger from './logger';

let supabase: SupabaseClient;

export const initSupabase = (): SupabaseClient => {
  if (!supabase) {
    supabase = createClient(config.supabase.url, config.supabase.anonKey);
    logger.info('Supabase client initialized');
  }
  return supabase;
};

export const getSupabase = (): SupabaseClient => {
  if (!supabase) {
    return initSupabase();
  }
  return supabase;
};

export const testConnection = async (): Promise<boolean> => {
  try {
    const { error } = await getSupabase().from('service_channels').select('count').limit(1);
    if (error) {
      logger.error('Supabase connection test failed:', error);
      return false;
    }
    logger.info('✅ Supabase connection successful');
    return true;
  } catch (error) {
    logger.error('Supabase connection test failed:', error);
    return false;
  }
};

export default { initSupabase, getSupabase, testConnection };
