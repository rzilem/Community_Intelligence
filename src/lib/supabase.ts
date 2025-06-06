// Community Intelligence - Supabase Configuration
// File: frontend/src/lib/supabase.ts

import { createClient } from '@supabase/supabase-js';

// Your Supabase configuration is loaded from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Create and export the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Alternative approach for different environments
export const createSupabaseClient = () => {
  return createClient(supabaseUrl, supabaseAnonKey);
};

// Export the default client
export default supabase;
