
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
          
        if (error) throw error;
        
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
            // Not found, return default empty value
            return new Response(JSON.stringify({ value: {} }), {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 404,
            });
          }
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
        // Parse the request body
        const requestData = await req.json();
        console.log(`Updating setting '${action}' with data:`, JSON.stringify(requestData));
        
        // Update the setting
        const { data, error } = await supabase
          .from('system_settings')
          .upsert({ 
            key: action, 
            value: requestData,
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'key'
          })
          .select();
          
        if (error) {
          console.error("Error updating settings:", error);
          throw error;
        }
        
        console.log(`Successfully updated setting '${action}'`);
        
        return new Response(JSON.stringify(data), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        });
      }
    }
    
    // If we reached this point, the request was not handled
    return new Response(JSON.stringify({ 
      error: 'Not found or method not allowed' 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 404,
    });
    
  } catch (error) {
    console.error('Error processing request:', error);
    
    return new Response(JSON.stringify({ 
      error: error.message || 'An unexpected error occurred' 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
