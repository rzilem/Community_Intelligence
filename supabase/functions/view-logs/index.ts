
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

// Define CORS headers for browser access
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }
  
  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Parse query parameters
    const url = new URL(req.url);
    const functionName = url.searchParams.get('function_name');
    const level = url.searchParams.get('level');
    const requestId = url.searchParams.get('request_id');
    const limit = parseInt(url.searchParams.get('limit') || '100');
    const offset = parseInt(url.searchParams.get('offset') || '0');
    
    console.log("Query parameters:", { functionName, level, requestId, limit, offset });
    
    // Build query to fetch logs
    let query = supabase.from('function_logs').select('*');
    
    // Apply filters if provided
    if (functionName) {
      query = query.eq('function_name', functionName);
    }
    if (level) {
      query = query.eq('level', level);
    }
    if (requestId) {
      query = query.eq('request_id', requestId);
    }
    
    // Apply sorting and pagination
    query = query.order('timestamp', { ascending: false })
      .limit(limit)
      .range(offset, offset + limit - 1);
    
    // Execute the query
    const { data: logs, error } = await query;
    
    if (error) {
      throw error;
    }
    
    // Get unique function names for the filter dropdown
    const { data: functionNames } = await supabase
      .from('function_logs')
      .select('function_name')
      .limit(100);
    
    const uniqueFunctionNames = [...new Set(functionNames?.map(item => item.function_name))];
    
    // Return the logs
    return new Response(
      JSON.stringify({
        success: true,
        logs,
        function_names: uniqueFunctionNames,
        meta: {
          total: logs.length,
          limit,
          offset,
          filters: {
            function_name: functionName,
            level,
            request_id: requestId
          }
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );
  } catch (error) {
    console.error('Error fetching logs:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
