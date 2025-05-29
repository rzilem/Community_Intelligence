// Community Intelligence - Supabase Configuration
// File: frontend/src/lib/supabase.ts

import { createClient } from '@supabase/supabase-js';

// Your Supabase configuration
const supabaseUrl = 'https://cahergndkwfqltxyikyr.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNhaGVyZ25ka3dmcWx0eHlpa3lyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQwOTUzMTYsImV4cCI6MjA1OTY3MTMxNn0.n_tRSJy3M9IaiyrhG02kpvko-pWd6XyYs4khDauxRGQ';

// Create and export the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Alternative approach for different environments
export const createSupabaseClient = () => {
  return createClient(supabaseUrl, supabaseAnonKey);
};

// Export the default client
export default supabase;
