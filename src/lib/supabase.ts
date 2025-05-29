
// Community Intelligence - Supabase Configuration
// This file is kept for backward compatibility but redirects to the main client
// File: frontend/src/lib/supabase.ts

import { supabase as mainSupabaseClient } from '@/integrations/supabase/client';

// Export the main client for backward compatibility
export const supabase = mainSupabaseClient;

// Alternative approach for different environments
export const createSupabaseClient = () => {
  return mainSupabaseClient;
};

// Export the default client
export default mainSupabaseClient;

