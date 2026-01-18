import { createClient, SupabaseClient } from '@supabase/supabase-js';
import config from '../config';
import logger from './logger';

// Create Supabase client
const supabase: SupabaseClient = createClient(
  config.supabase.url,
  config.supabase.anonKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

// Test connection
async function testConnection() {
  try {
    const { error } = await supabase
      .from('users')
      .select('count')
      .limit(1);

    if (error) {
      logger.warn('Supabase connection test failed (non-critical):', error);
      return false;
    }

    logger.info('✅ Supabase connection successful');
    return true;
  } catch (error) {
    logger.warn('❌ Failed to connect to Supabase (non-critical):', error);
    return false;
  }
}

// Test connection on startup (but don't exit on failure)
testConnection().catch((error) => {
  logger.warn('Supabase connection test failed during startup:', error);
});

export default supabase;