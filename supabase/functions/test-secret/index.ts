
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { createLogger, generateRequestId } from "../shared/logging.ts";

// Define CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

serve(async (req) => {
  // Generate unique request ID
  const requestId = generateRequestId();
  const logger = createLogger("test-secret");
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders
    });
  }
  
  // Only allow POST requests
  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({
        success: false,
        error: "Method not allowed",
        requestId
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 405
      }
    );
  }
  
  try {
    // Parse request body
    let body;
    try {
      body = await req.json();
    } catch (parseError) {
      await logger.error(requestId, "Invalid JSON in request body", parseError);
      return new Response(
        JSON.stringify({
          success: false,
          error: "Invalid JSON in request body",
          requestId
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400
        }
      );
    }
    
    const { name } = body;
    
    // Validate inputs
    if (!name) {
      await logger.error(requestId, "Missing required fields", 
        new Error("Secret name is required"),
        { name: !!name }
      );
      
      return new Response(
        JSON.stringify({
          success: false,
          error: "Missing required fields. Secret name is required.",
          requestId
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400
        }
      );
    }
    
    // Log the check attempt
    await logger.info(requestId, "Checking secret existence", {
      name
    });
    
    // Initialize Supabase admin client
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!supabaseUrl || !supabaseServiceKey) {
      const missingError = new Error("Missing Supabase environment variables");
      await logger.error(requestId, "Configuration error", missingError, {
        hasUrl: !!supabaseUrl,
        hasKey: !!supabaseServiceKey
      });
      
      throw missingError;
    }
    
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    
    try {
      // Try to retrieve the secret value - if there's no error, the secret exists
      // We don't need to return the actual value, just check if it exists
      const secretResult = await supabaseAdmin.functions.invokeFunction('secrets', {
        name
      });
      
      if (secretResult.error) {
        await logger.warn(requestId, "Secret does not exist", {
          name,
          error: secretResult.error
        });
        
        return new Response(
          JSON.stringify({
            success: false,
            exists: false,
            message: `Secret "${name}" does not exist`,
            requestId
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200
          }
        );
      }
      
      await logger.info(requestId, "Secret existence check completed", {
        name,
        exists: true
      });
      
      // Return success response
      return new Response(
        JSON.stringify({
          success: true,
          exists: true,
          message: `Secret "${name}" exists`,
          requestId
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200
        }
      );
    } catch (supabaseError) {
      await logger.error(requestId, "Error checking secret", supabaseError);
      
      return new Response(
        JSON.stringify({
          success: false,
          error: supabaseError instanceof Error ? supabaseError.message : "Unknown Supabase error",
          requestId
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500
        }
      );
    }
  } catch (error) {
    await logger.error(requestId, "Error in test-secret function", error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        requestId
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500
      }
    );
  }
});
