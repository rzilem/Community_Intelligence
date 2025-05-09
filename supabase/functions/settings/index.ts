
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
  const logger = createLogger('settings');
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    await logger.info(requestId, "Settings function called with URL:", { url: req.url });
    
    // Create a Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Parse the request URL to get the path components
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/').filter(Boolean);
    
    // The last part of the path should be the action
    const action = pathParts[pathParts.length - 1];
    
    await logger.info(requestId, `Processing settings request`, { 
      action,
      method: req.method 
    });

    // Process based on the action and HTTP method
    if (req.method === 'GET') {
      if (action === 'all') {
        // Fetch all settings
        const { data, error } = await supabase
          .from('system_settings')
          .select('key, value');
          
        if (error) {
          await logger.error(requestId, "Error fetching all settings:", { error });
          throw error;
        }
        
        // Transform the result into a more usable format
        const settings = {};
        data.forEach(item => {
          settings[item.key] = item.value;
        });
        
        await logger.info(requestId, "Successfully fetched all settings", { 
          settingsCount: Object.keys(settings).length 
        });
        
        return new Response(JSON.stringify(settings), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        });
      } 
      else if (action) {
        // Fetch a specific setting
        const { data, error } = await supabase
          .from('system_settings')
          .select('value')
          .eq('key', action)
          .single();
          
        if (error) {
          if (error.code === 'PGRST116') {
            await logger.info(requestId, `Setting '${action}' not found, returning default empty value`);
            // Not found, return default empty value
            return new Response(JSON.stringify({ value: {} }), {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 200,
            });
          }
          await logger.error(requestId, `Error fetching setting '${action}':`, { error });
          throw error;
        }
        
        await logger.info(requestId, `Successfully fetched setting '${action}'`);
        
        return new Response(JSON.stringify(data), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        });
      }
    } 
    else if (req.method === 'POST' || req.method === 'PUT') {
      if (action) {
        try {
          // Parse the request body
          const requestData = await req.json();
          await logger.info(requestId, `Updating setting '${action}'`, { 
            data: action === 'integrations' ? {
              ...requestData,
              integrationSettings: requestData.integrationSettings ? 
                Object.fromEntries(Object.entries(requestData.integrationSettings).map(([key, value]) => {
                  // Mask API keys in logs
                  if (typeof value === 'object' && value !== null && 'apiKey' in value) {
                    return [key, { ...value, apiKey: value.apiKey ? "[PRESENT]" : "[MISSING]" }];
                  }
                  return [key, value];
                })) : null
            } : requestData
          });
          
          // Log specific integration data for debugging
          if (action === 'integrations' && requestData.integrationSettings) {
            Object.keys(requestData.integrationSettings).forEach(integration => {
              logger.debug(requestId, `Integration ${integration} config:`, {
                ...requestData.integrationSettings[integration],
                apiKey: requestData.integrationSettings[integration].apiKey ? "PRESENT" : "MISSING"
              });
            });
          }
          
          // Update the setting
          const { error } = await supabase
            .from('system_settings')
            .upsert({ 
              key: action, 
              value: requestData,
              updated_at: new Date().toISOString()
            }, {
              onConflict: 'key'
            });
            
          if (error) {
            await logger.error(requestId, "Error updating settings:", { error });
            return new Response(JSON.stringify({ 
              success: false,
              error: `Database error: ${error.message}` 
            }), {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 200,
            });
          }
          
          await logger.info(requestId, `Successfully updated setting '${action}'`);
          
          // Return a valid JSON response with success status
          return new Response(JSON.stringify({ 
            success: true,
            message: "Settings updated successfully" 
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          });
        } catch (parseError) {
          await logger.error(requestId, "Error parsing request JSON:", { error: parseError });
          return new Response(JSON.stringify({ 
            success: false,
            error: 'Invalid JSON in request body: ' + ((parseError as Error).message || 'Unknown parsing error')
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          });
        }
      }
    }
    
    // If we reached this point, the request was not handled
    await logger.warn(requestId, "Request not handled:", { method: req.method, action });
    return new Response(JSON.stringify({ 
      success: false,
      error: 'Not found or method not allowed',
      details: { method: req.method, action }
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
      error: (error as Error).message || 'An unexpected error occurred',
      stack: (error as Error).stack
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  }
});
