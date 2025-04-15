
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
    // Create a Supabase client to fetch the OpenAI API key
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch the OpenAI API key from system settings
    const { data: settingsData, error: settingsError } = await supabase
      .from('system_settings')
      .select('value')
      .eq('key', 'integrations')
      .single();

    if (settingsError) {
      console.error("Error fetching settings:", settingsError);
      return new Response(JSON.stringify({
        success: false,
        error: "Failed to retrieve OpenAI API key"
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    // Extract the OpenAI config data
    const integrationSettings = settingsData?.value?.integrationSettings || {};
    const openAIConfig = integrationSettings.OpenAI || {};
    const apiKey = openAIConfig.apiKey;
    const model = openAIConfig.model || 'gpt-4o-mini';

    if (!apiKey) {
      return new Response(JSON.stringify({
        success: false,
        error: "No OpenAI API key configured"
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    console.log("Testing OpenAI connection with model:", model);

    // Test the OpenAI API
    try {
      const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: model,
          messages: [
            {
              role: 'system',
              content: 'You are a helpful assistant for a homeowners association management system.'
            },
            {
              role: 'user',
              content: 'Say "Connection successful" and nothing else.'
            }
          ],
          max_tokens: 50
        })
      });

      if (!openaiResponse.ok) {
        const errorData = await openaiResponse.json();
        console.error("OpenAI API error:", errorData);
        
        return new Response(JSON.stringify({
          success: false,
          error: errorData.error?.message || "Error connecting to OpenAI API"
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 502,
        });
      }

      const result = await openaiResponse.json();
      const response = result.choices[0].message.content.trim();

      return new Response(JSON.stringify({
        success: true,
        response,
        model
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    } catch (openaiError) {
      console.error("Error calling OpenAI:", openaiError);
      return new Response(JSON.stringify({
        success: false,
        error: openaiError.message || "Error connecting to OpenAI API"
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 502,
      });
    }
  } catch (error) {
    console.error("Unexpected error:", error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message || "An unexpected error occurred"
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
