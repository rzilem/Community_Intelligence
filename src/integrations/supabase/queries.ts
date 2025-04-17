import { supabase } from './client';

/**
 * Simple function to check if a table exists and is accessible
 * Does not use any schema introspection that might be blocked by permissions
 */
export const checkTableAccess = async (tableName: string) => {
  try {
    // Use a function call to check table access to avoid TypeScript errors
    const { data, error } = await supabase.rpc('check_table_access', {
      table_name: tableName
    });
    
    return { 
      accessible: data || false,
      error
    };
  } catch (error) {
    console.error(`Error checking access to ${tableName} table:`, error);
    return { 
      accessible: false, 
      error: { message: `Could not check access to ${tableName}` } 
    };
  }
};

/**
 * Get a list of accessible storage buckets
 */
export const getStorageBuckets = async () => {
  try {
    const { data, error } = await supabase.storage.listBuckets();
    
    if (error) {
      console.error('Error fetching storage buckets:', error);
      return { data: [], error };
    }
    
    return { data, error: null };
  } catch (err) {
    console.error('Unexpected error fetching storage buckets:', err);
    return { data: [], error: err };
  }
};
