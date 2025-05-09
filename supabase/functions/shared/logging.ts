
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
  
  // Helper to sanitize objects before logging (remove sensitive data)
  const sanitizeForLogging = (obj: any): any => {
    if (!obj || typeof obj !== 'object') return obj;
    
    const sanitized = { ...obj };
    // Remove any properties that might contain sensitive information
    const sensitiveKeys = ['apiKey', 'key', 'password', 'secret', 'token', 'authorization'];
    
    for (const key of Object.keys(sanitized)) {
      if (sensitiveKeys.some(sk => key.toLowerCase().includes(sk))) {
        sanitized[key] = '[REDACTED]';
      } else if (typeof sanitized[key] === 'object') {
        sanitized[key] = sanitizeForLogging(sanitized[key]);
      }
    }
    return sanitized;
  };
  
  const logToConsole = (entry: Omit<LogEntry, 'function_name'>, additionalData?: Record<string, any>) => {
    const { request_id, level, message } = entry;
    const timestamp = new Date().toISOString();
    
    // Sanitize metadata before logging
    const sanitizedMetadata = sanitizeForLogging(entry.metadata);
    const sanitizedAdditional = sanitizeForLogging(additionalData);
    
    console.log(JSON.stringify({
      request_id,
      function_name: functionName,
      timestamp,
      level,
      message,
      ...sanitizedMetadata,
      ...sanitizedAdditional
    }));
  };
  
  return {
    /**
     * Log to both console and Supabase function_logs table with extended details
     */
    async log(entry: Omit<LogEntry, 'function_name'>): Promise<void> {
      const { request_id, level, message, metadata } = entry;
      const timestamp = new Date().toISOString();
      
      // Log to console with structured format
      logToConsole(entry);
      
      try {
        // Sanitize metadata before storing in database
        const sanitizedMetadata = sanitizeForLogging(metadata);
        
        // Store in function_logs table
        const { error, data } = await supabase.from('function_logs').insert({
          request_id,
          function_name: functionName,
          timestamp,
          level,
          message,
          metadata: sanitizedMetadata
        }).select();
        
        if (error) {
          // Don't throw, just log to console
          logToConsole({
            request_id,
            level: 'error',
            message: `Failed to store log in database: ${error.message}`
          }, { error: error });
        }
      } catch (err) {
        // If table doesn't exist yet or other error, just continue
        logToConsole({
          request_id,
          level: 'warn',
          message: `Could not store log in database: ${(err as Error).message}`
        }, { error: err });
      }
    },
    
    /**
     * Log info level message
     */
    async info(requestId: string, message: string, metadata?: Record<string, any>): Promise<void> {
      return this.log({ request_id: requestId, level: 'info', message, metadata });
    },
    
    /**
     * Log error level message with full error details including stack trace
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
     * Log debug level message with detailed context
     */
    async debug(requestId: string, message: string, metadata?: Record<string, any>): Promise<void> {
      return this.log({ request_id: requestId, level: 'debug', message, metadata });
    }
  };
}
