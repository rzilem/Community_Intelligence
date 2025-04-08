
import { supabase } from './client';

/**
 * Get information about database schema and tables
 * This function wraps the get_schema_info RPC call or falls back to a direct query
 */
export const getSchemaInfo = async () => {
  try {
    // Try to use a custom RPC function if available
    const { data, error } = await supabase.rpc('get_schema_info');
    
    if (error) {
      console.error('Error using get_schema_info RPC:', error);
      
      // Fall back to directly querying information_schema (may be restricted by permissions)
      const { data: fallbackData, error: fallbackError } = await supabase.from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public')
        .order('table_name');
      
      if (fallbackError) {
        console.error('Error querying information_schema:', fallbackError);
        return { data: null, error: fallbackError };
      }
      
      return { data: fallbackData, error: null };
    }
    
    return { data, error: null };
  } catch (err) {
    console.error('Unexpected error in getSchemaInfo:', err);
    return { data: null, error: err };
  }
};
