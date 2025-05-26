
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { action, ...body } = await req.json();

    switch (action) {
      case 'get_ai_config': {
        // Try to get AI configuration from secrets
        const configKeys = [
          'AI_CONFIDENCE_THRESHOLD',
          'AI_HIGH_CONFIDENCE_THRESHOLD', 
          'AI_PROCESSING_TIMEOUT',
          'AI_RETRY_ATTEMPTS',
          'MAX_FILE_SIZE',
          'ALLOWED_FILE_TYPES'
        ];

        const config: Record<string, string> = {};
        
        // Since we can't directly read secrets, we'll return empty config
        // The secrets will be available when used in other edge functions
        
        return new Response(
          JSON.stringify({ 
            success: true, 
            config: {},
            message: 'Configuration will be loaded from secrets when used'
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200 
          }
        );
      }

      case 'integrations': {
        // Get integration settings from system_settings table
        const { data: settings, error } = await supabase
          .from('system_settings')
          .select('value')
          .eq('key', 'integrationSettings')
          .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
          console.error('Error fetching integration settings:', error);
          return new Response(
            JSON.stringify({ success: false, error: error.message }),
            { 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 500 
            }
          );
        }

        return new Response(
          JSON.stringify({ 
            success: true, 
            integrationSettings: settings?.value || {} 
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200 
          }
        );
      }

      default: {
        if (req.method === 'PUT') {
          // Handle integration settings update
          const { integrationSettings } = body;
          
          if (integrationSettings) {
            const { error } = await supabase
              .from('system_settings')
              .upsert({
                key: 'integrationSettings',
                value: integrationSettings
              });

            if (error) {
              console.error('Error updating integration settings:', error);
              return new Response(
                JSON.stringify({ success: false, error: error.message }),
                { 
                  headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                  status: 500 
                }
              );
            }

            return new Response(
              JSON.stringify({ success: true }),
              { 
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200 
              }
            );
          }
        }

        return new Response(
          JSON.stringify({ success: false, error: 'Invalid action' }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400 
          }
        );
      }
    }
  } catch (error) {
    console.error('Settings function error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
