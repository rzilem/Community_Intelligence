
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
    
    // Instead of trying to update the secret directly through REST API,
    // we'll store the key in the database and then use it in edge functions
    try {
      await logger.info(requestId, "Updating system_settings with OpenAI configuration");
      
      const selectedModel = model || "gpt-4o";
      
      // Update the system_settings table with OpenAI configuration
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

      // Also set the edge function secret for direct access in other edge functions
      try {
        // Edge functions can access each other's secrets
        const { data: secretData, error: secretError } = await supabase
          .rpc('set_edge_function_secret', {
            name: 'OPENAI_API_KEY',
            value: apiKey
          });

        if (secretError) {
          await logger.warn(requestId, "Could not set edge function secret via RPC, will try direct API call", { 
            error: secretError.message 
          });
          
          // Fallback to direct API call if RPC is not available
          const projectRef = Deno.env.get('SUPABASE_PROJECT_REF') || 'cahergndkwfqltxyikyr';
          const secretsUrl = `https://${projectRef}.supabase.co/functions/v1/secrets`;
          
          const secretsResponse = await fetch(secretsUrl, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${supabaseServiceKey}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
              name: 'OPENAI_API_KEY',
              value: apiKey
            }),
          });
          
          if (!secretsResponse.ok) {
            await logger.warn(requestId, "Failed to set secret via direct API call, but database update was successful", {
              status: secretsResponse.status,
              statusText: secretsResponse.statusText
            });
            // We'll continue even if this fails since the database update was successful
          } else {
            await logger.info(requestId, "Successfully set OPENAI_API_KEY secret via direct API call");
          }
        } else {
          await logger.info(requestId, "Successfully set OPENAI_API_KEY secret via RPC");
        }
      } catch (secretError) {
        // We'll log but not fail if setting the secret fails, since the main database update was successful
        await logger.warn(requestId, "Error setting edge function secret, but database update was successful", {
          error: (secretError as Error).message
        });
      }
    } catch (dbError) {
      await logger.error(requestId, "Error in database update step", {
        error: (dbError as Error).message,
        stack: (dbError as Error).stack
      });
      throw dbError;
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
