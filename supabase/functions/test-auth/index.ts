
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { testAuthorization } from "../shared/authorized-fetch.ts";

// CORS headers for browser access
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const requestId = crypto.randomUUID();
  console.log(`[${requestId}] Testing authentication and authorization`);

  try {
    // Get environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    // Log information about the request (sanitizing any sensitive data)
    const headers: Record<string, string> = {};
    req.headers.forEach((value, key) => {
      if (key.toLowerCase() === 'authorization') {
        headers[key] = value.startsWith('Bearer ') ? 'Bearer [redacted]' : '[redacted]';
      } else {
        headers[key] = value;
      }
    });
    
    console.log(`[${requestId}] Request headers:`, headers);
    
    // Check environment variables
    if (!supabaseUrl || !supabaseServiceKey) {
      const missing = [];
      if (!supabaseUrl) missing.push('SUPABASE_URL');
      if (!supabaseServiceKey) missing.push('SUPABASE_SERVICE_ROLE_KEY');
      
      console.error(`[${requestId}] Missing required environment variables: ${missing.join(', ')}`);
      
      return new Response(JSON.stringify({
        success: false,
        message: 'Missing required environment variables',
        missing
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Test the authorization
    console.log(`[${requestId}] Testing authorization with service role key`);
    const authResult = await testAuthorization(supabaseServiceKey, supabaseUrl);
    
    console.log(`[${requestId}] Authorization test result:`, {
      valid: authResult.valid,
      status: authResult.status,
      message: authResult.message
    });

    // If authorized, test creating a Supabase client
    let clientTestResult = { success: false, message: "Client test not run" };
    if (authResult.valid) {
      try {
        console.log(`[${requestId}] Testing Supabase client initialization`);
        const supabase = createClient(supabaseUrl, supabaseServiceKey);
        
        // Try a simple query
        const { data, error } = await supabase.from('function_logs')
          .select('function_name')
          .limit(1);
        
        if (error) {
          console.error(`[${requestId}] Supabase client query error:`, error);
          clientTestResult = {
            success: false,
            message: `Client query failed: ${error.message}`,
          };
        } else {
          console.log(`[${requestId}] Supabase client query succeeded`);
          clientTestResult = {
            success: true,
            message: "Supabase client initialized and query succeeded"
          };
        }
      } catch (clientError) {
        console.error(`[${requestId}] Supabase client initialization error:`, clientError);
        clientTestResult = {
          success: false,
          message: `Client initialization failed: ${clientError instanceof Error ? clientError.message : String(clientError)}`
        };
      }
    }

    // Return the test results
    return new Response(JSON.stringify({
      success: true,
      requestId,
      authorization: authResult,
      client: clientTestResult,
      environment: {
        hasSupabaseUrl: !!supabaseUrl,
        supabaseUrlLength: supabaseUrl?.length || 0,
        hasServiceRoleKey: !!supabaseServiceKey,
        serviceRoleKeyLength: supabaseServiceKey?.length || 0
      }
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error(`[${requestId}] Unexpected error:`, error);
    
    return new Response(JSON.stringify({
      success: false,
      message: 'Unexpected error during authentication test',
      error: error instanceof Error ? error.message : String(error)
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
