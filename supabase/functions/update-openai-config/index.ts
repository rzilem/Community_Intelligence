
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
  const logger = createLogger('update-openai-config');
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    await logger.info(requestId, "Update OpenAI config function called");
    
    // Get API key from request
    const { apiKey, model } = await req.json();
    
    if (!apiKey) {
      await logger.error(requestId, "No API key provided");
      return new Response(JSON.stringify({ success: false, error: "API key is required" }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }
    
    // Create a Supabase client with service role key for admin access
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // 1. Update the OPENAI_API_KEY secret using REST API directly
    await logger.info(requestId, "Updating OPENAI_API_KEY secret via REST API");
    
    // Create appropriate headers for the function service API
    const functionApiHeaders = {
      'Authorization': `Bearer ${supabaseServiceKey}`,
      'Content-Type': 'application/json'
    };
    
    // Call the Supabase function secrets API to update the secret
    const secretsResponse = await fetch(`${supabaseUrl}/functions/v1/secrets`, {
      method: 'POST',
      headers: functionApiHeaders,
      body: JSON.stringify({ 
        secrets: { OPENAI_API_KEY: apiKey } 
      }),
    });
    
    if (!secretsResponse.ok) {
      const secretsError = await secretsResponse.json();
      await logger.error(requestId, "Failed to update API key secret via REST API", { 
        status: secretsResponse.status, 
        error: secretsError 
      });
      throw new Error(`Failed to update API key: ${secretsResponse.statusText}`);
    }
    
    await logger.info(requestId, "Successfully updated OPENAI_API_KEY secret");
    
    // 2. Update the system_settings table with OpenAI configuration
    const selectedModel = model || "gpt-4o-mini";
    
    const { error } = await supabase
      .from('system_settings')
      .upsert({ 
        key: 'integrations', 
        value: {
          integrationSettings: {
            OpenAI: {
              apiKey: apiKey,
              model: selectedModel,
              configDate: new Date().toISOString()
            }
          }
        },
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'key'
      });
      
    if (error) {
      await logger.error(requestId, "Error updating system settings", { error });
      throw new Error(`Failed to update system settings: ${error.message}`);
    }
    
    await logger.info(requestId, "Successfully updated OpenAI integration settings");
    
    // 3. Verify the setup by querying the data
    const { data: verifyData, error: verifyError } = await supabase
      .from('system_settings')
      .select('value')
      .eq('key', 'integrations')
      .single();
      
    if (verifyError) {
      await logger.warn(requestId, "Verification query failed", { error: verifyError });
      // Continue despite verification failure
    } else {
      await logger.info(requestId, "Verification successful", { 
        hasOpenAIConfig: verifyData?.value?.integrationSettings?.OpenAI ? true : false 
      });
    }
    
    // Return success response
    return new Response(JSON.stringify({ 
      success: true,
      message: "OpenAI API key and configuration updated successfully" 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
    
  } catch (error) {
    await logger.error(requestId, 'Error processing request:', { 
      error: (error as Error).message,
      stack: (error as Error).stack 
    });
    
    return new Response(JSON.stringify({ 
      success: false,
      error: (error as Error).message || 'An unexpected error occurred'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
