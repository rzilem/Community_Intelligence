
import { supabase } from './client';

/**
 * Simple function to check if a table exists and is accessible
 * Does not use any schema introspection that might be blocked by permissions
 */
export const checkTableAccess = async (tableName: string) => {
  try {
    // Instead of using an RPC function, try a simple count query with limit 0
    // This avoids errors but still checks access permissions
    const { count, error } = await supabase
      .from(tableName)
      .select('*', { count: 'exact', head: true })
      .limit(0);
    
    return { 
      accessible: error ? false : true,
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
