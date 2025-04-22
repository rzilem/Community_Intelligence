
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.47.0";

// Set up CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Settings function called with URL:", req.url);
    
    // Create a Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Parse the request URL to get the path components
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/').filter(Boolean);
    
    // The last part of the path should be the action
    const action = pathParts[pathParts.length - 1];
    
    console.log(`Processing settings request for action: ${action}, method: ${req.method}`);

    // Process based on the action and HTTP method
    if (req.method === 'GET') {
      if (action === 'all') {
        // Fetch all settings
        const { data, error } = await supabase
          .from('system_settings')
          .select('key, value');
          
        if (error) {
          console.error("Error fetching all settings:", error);
          throw error;
        }
        
        // Transform the result into a more usable format
        const settings = {};
        data.forEach(item => {
          settings[item.key] = item.value;
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
            console.log(`Setting '${action}' not found, returning default empty value`);
            // Not found, return default empty value
            return new Response(JSON.stringify({ value: {} }), {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 200,
            });
          }
          console.error(`Error fetching setting '${action}':`, error);
          throw error;
        }
        
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
          let requestData = null;
          try {
            const rawBody = await req.text();
            console.log(`Raw request body: ${rawBody}`);
            
            if (rawBody.trim() === '') {
              requestData = {};
            } else {
              requestData = JSON.parse(rawBody);
            }
          } catch (parseError) {
            console.error("Error parsing request JSON:", parseError);
            return new Response(JSON.stringify({ 
              success: false,
              error: 'Invalid JSON in request body: ' + (parseError.message || 'Unknown parsing error')
            }), {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 200,
            });
          }
          
          console.log(`Updating setting '${action}' with data:`, JSON.stringify(requestData));
          
          // Log specific integration data for debugging
          if (action === 'integrations' && requestData.integrationSettings) {
            Object.keys(requestData.integrationSettings).forEach(integration => {
              console.log(`Integration ${integration} config:`, JSON.stringify({
                ...requestData.integrationSettings[integration],
                apiKey: requestData.integrationSettings[integration].apiKey ? "PRESENT" : "MISSING"
              }));
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
            console.error("Error updating settings:", error);
            return new Response(JSON.stringify({ 
              success: false,
              error: `Database error: ${error.message}` 
            }), {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 200,
            });
          }
          
          console.log(`Successfully updated setting '${action}'`);
          
          // Return a valid JSON response with success status
          return new Response(JSON.stringify({ 
            success: true,
            message: "Settings updated successfully" 
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          });
        } catch (error) {
          console.error("Error processing request:", error);
          return new Response(JSON.stringify({ 
            success: false,
            error: 'Error processing request: ' + (error.message || 'Unknown error')
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          });
        }
      }
    }
    
    // If we reached this point, the request was not handled
    console.log("Request not handled:", req.method, action);
    return new Response(JSON.stringify({ 
      success: false,
      error: 'Not found or method not allowed',
      details: { method: req.method, action }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
    
  } catch (error) {
    console.error('Error processing request:', error);
    
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message || 'An unexpected error occurred',
      stack: error.stack
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  }
});
