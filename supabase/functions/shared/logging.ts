
// Shared logging utility for edge functions
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

export interface LogEntry {
  request_id: string;
  function_name: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  metadata?: Record<string, any>;
}

/**
 * Initialize the logging service with Supabase credentials
 */
export function createLogger(functionName: string) {
  const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  return {
    /**
     * Log to both console and Supabase function_logs table
     */
    async log(entry: Omit<LogEntry, 'function_name'>): Promise<void> {
      const { request_id, level, message, metadata } = entry;
      const timestamp = new Date().toISOString();
      
      // Log to console with structured format
      console.log(JSON.stringify({
        request_id,
        function_name: functionName,
        timestamp,
        level,
        message,
        ...metadata
      }));
      
      try {
        // Store in function_logs table
        const { error } = await supabase.from('function_logs').insert({
          request_id,
          function_name: functionName,
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
        console.warn(`Could not store log in database: ${(err as Error).message}`);
      }
    },
    
    /**
     * Log info level message
     */
    async info(requestId: string, message: string, metadata?: Record<string, any>): Promise<void> {
      return this.log({ request_id: requestId, level: 'info', message, metadata });
    },
    
    /**
     * Log error level message
     */
    async error(requestId: string, message: string, metadata?: Record<string, any>): Promise<void> {
      return this.log({ request_id: requestId, level: 'error', message, metadata });
    },
    
    /**
     * Log warning level message
     */
    async warn(requestId: string, message: string, metadata?: Record<string, any>): Promise<void> {
      return this.log({ request_id: requestId, level: 'warn', message, metadata });
    },
    
    /**
     * Log debug level message
     */
    async debug(requestId: string, message: string, metadata?: Record<string, any>): Promise<void> {
      return this.log({ request_id: requestId, level: 'debug', message, metadata });
    }
  };
}
