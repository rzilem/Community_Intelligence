
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

/**
 * Logging service for invoice receiver function
 */
export class LoggingService {
  private supabase: any;
  
  constructor(supabase: any) {
    this.supabase = supabase;
  }

  async logToSupabase(requestId: string, level: string, message: string, metadata: any) {
    try {
      const { error } = await this.supabase.from('function_logs').insert({
        request_id: requestId,
        function_name: 'invoice-receiver',
        timestamp: new Date().toISOString(),
        level,
        message,
        metadata
      });
      if (error) {
        console.error(`Failed to store log: ${error.message}`);
      }
    } catch (logError) {
      console.error(`Error logging to Supabase: ${(logError as Error).message}`);
    }
  }

  async logError(requestId: string, message: string, error: Error, metadata: any = {}) {
    console.error(`[${requestId}] ${message}: ${error.message}`);
    await this.logToSupabase(requestId, 'error', message, {
      ...metadata,
      error: error.message
    });
  }

  async logInfo(requestId: string, message: string, metadata: any = {}) {
    console.log(`[${requestId}] ${message}`);
    await this.logToSupabase(requestId, 'info', message, metadata);
  }
}
