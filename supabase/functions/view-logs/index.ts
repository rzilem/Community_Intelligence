
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.47.0";
import { createLogger } from "../shared/logging.ts";

// Set up CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Create request ID for tracing
  const requestId = crypto.randomUUID();
  const logger = createLogger('view-logs');
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    await logger.info(requestId, "View logs function called");
    
    // Parse URL search params from the request URL
    const url = new URL(req.url);
    const functionName = url.searchParams.get('function_name');
    const level = url.searchParams.get('level');
    const limit = parseInt(url.searchParams.get('limit') || '100');
    const offset = parseInt(url.searchParams.get('offset') || '0');
    
    // Log the query parameters received
    console.log(JSON.stringify({
      request_id: requestId,
      function_name: 'view-logs',
      timestamp: new Date().toISOString(),
      level: null,
      message: "Query parameters",
      functionName,
      limit,
      offset
    }));
    
    // Create a Supabase client with service role key for admin access
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Build the query to get logs
    let query = supabase
      .from('function_logs')
      .select('*');
    
    // Apply filters if provided
    if (functionName) {
      query = query.eq('function_name', functionName);
    }
    if (level) {
      query = query.eq('level', level);
    }
    
    // Apply ordering and pagination
    // Fix: First apply the order, then chain limit and offset as separate operations
    const { data: logs, error } = await query
      .order('timestamp', { ascending: false })
      .limit(limit)
      .range(offset, offset + limit - 1);  // Using range instead of offset
    
    if (error) {
      await logger.error(requestId, "Error retrieving logs", { error });
      throw error;
    }
    
    await logger.info(requestId, "Logs retrieved successfully", { count: logs?.length ?? 0 });
    
    // Get all unique function names for the dropdown filter
    const { data: functionNames, error: functionNamesError } = await supabase
      .from('function_logs')
      .select('function_name')
      .limit(1000)
      .order('function_name')
      .distinctOn('function_name');
    
    if (functionNamesError) {
      await logger.error(requestId, "Error retrieving function names", { error: functionNamesError });
    } else {
      await logger.debug(requestId, "Function names retrieved", { count: functionNames?.length ?? 0 });
    }
    
    // Return logs and function names
    return new Response(JSON.stringify({ 
      logs: logs || [], 
      function_names: functionNames?.map(f => f.function_name) || []
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error("Error in view-logs function:", error);
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
