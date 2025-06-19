
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

const SUPABASE_URL = 'https://cahergndkwfqltxyikyr.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNhaGVyZ25ka3dmcWx0eHlpa3lyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQwOTUzMTYsImV4cCI6MjA1OTY3MTMxNn0.n_tRSJy3M9IaiyrhG02kpvko-pWd6XyYs4khDauxRGQ';

// Enhanced client with better authentication context
export const createEnhancedSupabaseClient = (userToken?: string) => {
  if (userToken) {
    // Create client with user token for proper RLS context
    return createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: {
        headers: {
          Authorization: `Bearer ${userToken}`
        }
      }
    });
  }
  
  // Default client
  return createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY);
};

// Utility to get user session token
export const getUserSessionToken = async () => {
  const client = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY);
  const { data: { session } } = await client.auth.getSession();
  return session?.access_token;
};
