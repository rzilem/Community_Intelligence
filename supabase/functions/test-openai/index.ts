
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
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Missing Supabase URL or service key");
      return new Response(JSON.stringify({
        success: false,
        error: "Server configuration error"
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }
    
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

    // Test the OpenAI API with a simple request
    try {
      const requestBody = JSON.stringify({
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
      });

      console.log("Sending request to OpenAI with body:", requestBody);
      
      const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: requestBody
      });

      // Get the response as text first so we can log it if there's a parsing error
      const responseText = await openaiResponse.text();
      console.log("Raw OpenAI response:", responseText);
      
      // Try to parse the response as JSON
      let result;
      try {
        result = JSON.parse(responseText);
      } catch (parseError) {
        console.error("Error parsing OpenAI response:", parseError, responseText);
        return new Response(JSON.stringify({
          success: false,
          error: `Invalid response from OpenAI: ${responseText.substring(0, 100)}...`
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200, // Return 200 instead of 502 to avoid edge function error
        });
      }

      if (!openaiResponse.ok) {
        console.error("OpenAI API error status:", openaiResponse.status, result);
        
        return new Response(JSON.stringify({
          success: false,
          error: result.error?.message || `Error connecting to OpenAI API: ${openaiResponse.status}`
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200, // Return 200 instead of 502 to avoid edge function error
        });
      }

      if (!result.choices || !result.choices[0] || !result.choices[0].message) {
        console.error("Unexpected OpenAI response structure:", result);
        return new Response(JSON.stringify({
          success: false,
          error: "Unexpected response structure from OpenAI"
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200, // Return 200 instead of 502 to avoid edge function error
        });
      }

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
        status: 200, // Return 200 instead of 502 to avoid edge function error
      });
    }
  } catch (error) {
    console.error("Unexpected error:", error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message || "An unexpected error occurred"
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200, // Return 200 instead of 502 to avoid edge function error
    });
  }
});
