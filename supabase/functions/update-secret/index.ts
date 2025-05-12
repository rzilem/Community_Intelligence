
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
  const logger = createLogger("update-secret");
  
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
    
    const { name, value } = body;
    
    // Validate inputs
    if (!name || !value) {
      await logger.error(requestId, "Missing required fields", 
        new Error("Name and value are required"),
        { name: !!name }
      );
      
      return new Response(
        JSON.stringify({
          success: false,
          error: "Missing required fields. Name and value are required.",
          requestId
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400
        }
      );
    }
    
    // Log the update attempt (redact the value)
    await logger.info(requestId, "Updating secret", {
      name,
      valueProvided: value ? "Yes" : "No"
    });
    
    // Initialize Supabase admin client
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase environment variables");
    }
    
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    
    try {
      // Update the secret - in a try/catch to handle errors properly
      await supabaseAdmin.functions.setSecret(name, value);
      
      await logger.info(requestId, "Secret updated successfully", { name });
      
      // Return success response
      return new Response(
        JSON.stringify({
          success: true,
          message: "Secret updated successfully",
          name,
          requestId
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200
        }
      );
    } catch (supabaseError) {
      await logger.error(requestId, "Supabase error while updating secret", supabaseError);
      
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
    await logger.error(requestId, "Error updating secret", error);
    
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
