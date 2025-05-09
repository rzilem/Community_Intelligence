
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
    
    await logger.debug(requestId, "Request payload received", { 
      hasApiKey: !!apiKey,
      model: model || 'not provided'
    });
    
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
    
    try {
      // Create appropriate headers for the REST API
      const secretsHeaders = {
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'apikey': supabaseServiceKey,
        'Content-Type': 'application/json'
      };
      
      // Call the correct Supabase REST API endpoint to update secrets
      // The correct endpoint should be /rest/v1/functions/secrets
      const secretsResponse = await fetch(`${supabaseUrl}/rest/v1/secrets`, {
        method: 'POST',
        headers: secretsHeaders,
        body: JSON.stringify({ 
          name: 'OPENAI_API_KEY',
          value: apiKey
        }),
      });
      
      await logger.debug(requestId, "Secrets API response received", {
        status: secretsResponse.status,
        statusText: secretsResponse.statusText
      });
      
      if (!secretsResponse.ok) {
        let secretsError = null;
        try {
          secretsError = await secretsResponse.json();
        } catch (e) {
          secretsError = { parseError: (e as Error).message };
        }
        
        await logger.error(requestId, "Failed to update API key secret via REST API", { 
          status: secretsResponse.status, 
          statusText: secretsResponse.statusText,
          error: secretsError 
        });
        
        throw new Error(`Failed to update API key: ${secretsResponse.statusText}`);
      }
      
      await logger.info(requestId, "Successfully updated OPENAI_API_KEY secret");
    } catch (secretError) {
      await logger.error(requestId, "Error in secrets update step", {
        error: (secretError as Error).message,
        stack: (secretError as Error).stack
      });
      throw secretError;
    }
    
    // 2. Update the system_settings table with OpenAI configuration
    try {
      const selectedModel = model || "gpt-4o-mini";
      
      await logger.info(requestId, "Updating system_settings with OpenAI configuration", {
        model: selectedModel
      });
      
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
    } catch (dbError) {
      await logger.error(requestId, "Error in database update step", {
        error: (dbError as Error).message,
        stack: (dbError as Error).stack
      });
      throw dbError;
    }
    
    // 3. Verify the setup by querying the data
    try {
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
    } catch (verifyError) {
      await logger.warn(requestId, "Error in verification step", {
        error: (verifyError as Error).message
      });
      // Continue despite verification failure
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
