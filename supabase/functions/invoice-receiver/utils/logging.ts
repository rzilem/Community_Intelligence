
// Logging utility for invoice-receiver function
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export interface LogEntry {
  request_id: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  metadata?: Record<string, any>;
}

/**
 * Log to both console and Supabase function_logs table
 */
export async function log(entry: LogEntry): Promise<void> {
  const { request_id, level, message, metadata } = entry;
  const timestamp = new Date().toISOString();
  
  // Log to console with structured format
  console.log(JSON.stringify({
    request_id,
    function: 'invoice-receiver',
    timestamp,
    level,
    message,
    ...metadata
  }));
  
  try {
    // Store in function_logs table if it exists
    const { error } = await supabase.from('function_logs').insert({
      request_id,
      function_name: 'invoice-receiver',
      timestamp,
      level,
      message,
      metadata
    });
    
    if (error) {
      // Don't throw, just log to console
      console.error(`Failed to store log in database: ${error.message}`);
    }
  } catch (err) {
    // If table doesn't exist yet or other error, just continue
    console.warn(`Could not store log in database: ${err.message}`);
  }
}
