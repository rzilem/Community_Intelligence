
import { createClient } from '@supabase/supabase-js';

// These values should be set by environment variables in a real app
// For this demo, we'll use placeholder values that will be replaced
// when the Supabase integration is properly set up
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  }
});
