
import { createClient } from '@supabase/supabase-js';
import { env, validateEnv } from '@/lib/env';

// Validate environment variables on startup
try {
  validateEnv();
} catch (error) {
  console.error('Supabase client initialization failed:', error);
  throw error;
}

const supabaseUrl = env.SUPABASE_URL;
const supabaseKey = env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});

// Development logging
if (env.DEV) {
  console.log('Supabase client initialized:', {
    url: supabaseUrl,
    hasKey: !!supabaseKey
  });
}
