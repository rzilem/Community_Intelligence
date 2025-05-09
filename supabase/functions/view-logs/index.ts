
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.47.0";
import { createLogger } from "../shared/logging.ts";

// Set up CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  // Create request ID and logger
  const requestId = crypto.randomUUID();
  const logger = createLogger('view-logs');
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    await logger.info(requestId, "View logs function called");
    
    // Create a Supabase client with auth context from the request
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Parse request params
    const url = new URL(req.url);
    const functionName = url.searchParams.get('function_name');
    const level = url.searchParams.get('level');
    const limit = parseInt(url.searchParams.get('limit') || '100', 10);
    const offset = parseInt(url.searchParams.get('offset') || '0', 10);
    
    await logger.debug(requestId, "Query parameters", { functionName, level, limit, offset });
    
    // Build the query
    let query = supabase
      .from('function_logs')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(limit)
      .range(offset, offset + limit - 1);
      
    // Add filters if provided
    if (functionName) {
      query = query.eq('function_name', functionName);
    }
    
    if (level) {
      query = query.eq('level', level);
    }
    
    // Execute the query
    const { data, error } = await query;
    
    if (error) {
      await logger.error(requestId, "Error fetching logs", { error });
      throw new Error(`Failed to fetch logs: ${error.message}`);
    }
    
    await logger.info(requestId, "Logs retrieved successfully", { count: data?.length || 0 });
    
    // Get list of unique function names for filtering
    const { data: functionNames, error: fnError } = await supabase
      .from('function_logs')
      .select('function_name')
      .distinct();
      
    if (fnError) {
      await logger.warn(requestId, "Failed to retrieve function names", { error: fnError });
    }
    
    // Return the logs
    return new Response(JSON.stringify({
      logs: data || [],
      function_names: functionNames?.map(fn => fn.function_name) || []
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
    
  } catch (error) {
    await logger.error(requestId, "Error processing logs request", {
      error: (error as Error).message,
      stack: (error as Error).stack
    });
    
    return new Response(JSON.stringify({
      error: (error as Error).message || 'An unexpected error occurred'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
