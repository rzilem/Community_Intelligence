
import { supabase } from './client';

/**
 * Simple function to check if a table exists and is accessible
 * Does not use any schema introspection that might be blocked by permissions
 */
export const checkTableAccess = async (tableName: string) => {
  try {
    // Use explicit type assertion to bypass TypeScript's strict checking
    const { data, error } = await supabase
      .from(tableName as any)
      .select('count')
      .limit(1);
      
    return { accessible: !error, error };
  } catch (err) {
    console.error(`Error checking table '${tableName}':`, err);
    return { accessible: false, error: err };
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
