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
      logger.error('Supabase connection test failed:', error);
      throw error;
    }

    logger.info('✅ Supabase connection successful');
  } catch (error) {
    logger.error('❌ Failed to connect to Supabase:', error);
    process.exit(1);
  }
}

// Test connection on startup
testConnection();

export default supabase;