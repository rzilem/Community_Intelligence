
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

    const url = new URL(req.url);
    const settingKey = url.pathname.split('/').pop();
    
    console.log('Settings function called:', {
      method: req.method,
      pathname: url.pathname,
      settingKey,
      timestamp: new Date().toISOString()
    });

    // Handle GET requests for specific settings
    if (req.method === 'GET' && settingKey && settingKey !== 'settings') {
      try {
        const { data, error } = await supabase
          .from('system_settings')
          .select('value')
          .eq('key', settingKey)
          .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
          console.error(`Error fetching ${settingKey} settings:`, error);
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: error.message,
              key: settingKey 
            }),
            { 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 500 
            }
          );
        }

        return new Response(
          JSON.stringify({ 
            success: true, 
            data: data?.value || getDefaultSetting(settingKey),
            key: settingKey
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200 
          }
        );
      } catch (err) {
        console.error(`Unexpected error fetching ${settingKey}:`, err);
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Internal server error',
            key: settingKey 
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500 
          }
        );
      }
    }

    // Handle POST/PUT requests with JSON body
    let body;
    try {
      const text = await req.text();
      if (text) {
        body = JSON.parse(text);
      } else {
        body = {};
      }
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Invalid JSON in request body' 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      );
    }

    const { action, ...bodyData } = body;

    switch (action) {
      case 'get_ai_config': {
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
        const { data: settings, error } = await supabase
          .from('system_settings')
          .select('value')
          .eq('key', 'integrations')
          .single();

        if (error && error.code !== 'PGRST116') {
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
        if (req.method === 'PUT' || req.method === 'POST') {
          // Handle setting updates
          if (settingKey && settingKey !== 'settings') {
            try {
              const { error } = await supabase
                .from('system_settings')
                .upsert({
                  key: settingKey,
                  value: bodyData
                });

              if (error) {
                console.error(`Error updating ${settingKey} settings:`, error);
                return new Response(
                  JSON.stringify({ success: false, error: error.message }),
                  { 
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                    status: 500 
                  }
                );
              }

              return new Response(
                JSON.stringify({ success: true, key: settingKey }),
                { 
                  headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                  status: 200 
                }
              );
            } catch (err) {
              console.error(`Unexpected error updating ${settingKey}:`, err);
              return new Response(
                JSON.stringify({ 
                  success: false, 
                  error: 'Internal server error' 
                }),
                { 
                  headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                  status: 500 
                }
              );
            }
          }

          // Handle legacy integration settings update
          const { integrationSettings } = bodyData;
          if (integrationSettings) {
            const { error } = await supabase
              .from('system_settings')
              .upsert({
                key: 'integrations',
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

        console.warn('Invalid action or method:', { action, method: req.method });
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Invalid action or method',
            received: { action, method: req.method }
          }),
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
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});

// Helper function to provide default settings
function getDefaultSetting(key: string) {
  const defaults = {
    appearance: {
      theme: 'system',
      colorScheme: 'default',
      density: 'default',
      animationsEnabled: true,
      fontScale: 1,
      showAuthDebugger: false
    },
    notifications: {
      emailNotifications: true,
      pushNotifications: true,
      smsNotifications: false,
      maintenanceAlerts: true,
      securityAlerts: true,
      newsAndUpdates: false
    },
    security: {
      twoFactorAuth: false,
      sessionTimeout: 30,
      passwordResetInterval: 90,
      ipWhitelist: []
    },
    preferences: {
      defaultAssociationId: '',
      defaultDateFormat: 'MM/DD/YYYY',
      defaultTimeFormat: '12h',
      defaultCurrency: 'USD',
      defaultLanguage: 'en',
      autoSave: true
    },
    integrations: {},
    webhook_settings: {
      cloudmailin_webhook_url: '',
      cloudmailin_secret: '',
      webhook_secret: ''
    }
  };

  return defaults[key as keyof typeof defaults] || {};
}
