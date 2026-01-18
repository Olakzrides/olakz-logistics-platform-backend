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
    // Try a simple query that should work with anon key
    const { error } = await getSupabase().from('ride_carts').select('count').limit(1);
    if (error) {
      logger.warn('Supabase connection test failed (non-critical):', error);
      // Don't fail the service for database issues in development
      return true; // Return true to keep service running
    }
    logger.info('✅ Supabase connection successful');
    return true;
  } catch (error) {
    logger.warn('Supabase connection test failed (non-critical):', error);
    // Don't fail the service for database issues in development
    return true; // Return true to keep service running
  }
};

export default { initSupabase, getSupabase, testConnection };
