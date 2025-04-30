
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
    console.log("Starting OpenAI test function");
    
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
        status: 200,
      });
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch the OpenAI API key from system settings
    console.log("Fetching OpenAI API key from system settings");
    const { data: settingsData, error: settingsError } = await supabase
      .from('system_settings')
      .select('value')
      .eq('key', 'integrations')
      .single();

    if (settingsError) {
      console.error("Error fetching settings:", settingsError);
      return new Response(JSON.stringify({
        success: false,
        error: "Failed to retrieve OpenAI API key: " + settingsError.message
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    // Extract the OpenAI config data
    const integrationSettings = settingsData?.value?.integrationSettings || {};
    const openAIConfig = integrationSettings.OpenAI || {};
    const apiKey = openAIConfig.apiKey;
    const model = openAIConfig.model || 'gpt-4o-mini';

    console.log("OpenAI config found:", openAIConfig ? "Yes" : "No");
    console.log("API Key present:", apiKey ? "Yes" : "No");
    console.log("Model:", model);

    if (!apiKey) {
      console.log("No OpenAI API key found in settings");
      return new Response(JSON.stringify({
        success: false,
        error: "No OpenAI API key configured. Please add your API key in the integration settings."
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
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

      console.log("Sending request to OpenAI API");
      
      const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: requestBody
      });

      console.log("OpenAI API response status:", openaiResponse.status);
      
      // Get the response as text first so we can log it if there's a parsing error
      const responseText = await openaiResponse.text();
      console.log("Raw OpenAI response:", responseText);
      
      // Try to parse the response as JSON
      let result;
      try {
        result = JSON.parse(responseText);
      } catch (parseError) {
        console.error("Error parsing OpenAI response:", parseError);
        return new Response(JSON.stringify({
          success: false,
          error: `Failed to parse OpenAI response: ${responseText.substring(0, 100)}...`,
          raw_response: responseText
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        });
      }

      if (!openaiResponse.ok) {
        console.error("OpenAI API error:", result);
        return new Response(JSON.stringify({
          success: false,
          error: result.error?.message || `Error from OpenAI API: ${openaiResponse.status}`,
          details: result.error || {}
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        });
      }

      if (!result.choices || !result.choices[0] || !result.choices[0].message) {
        console.error("Unexpected OpenAI response structure:", result);
        return new Response(JSON.stringify({
          success: false,
          error: "Unexpected response structure from OpenAI",
          response: result
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        });
      }

      const response = result.choices[0].message.content.trim();
      console.log("Successful OpenAI response:", response);

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
        error: `Error connecting to OpenAI API: ${openaiError.message || "Unknown error"}`,
        stack: openaiError.stack
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }
  } catch (error) {
    console.error("Unexpected error in test-openai function:", error);
    
    return new Response(JSON.stringify({
      success: false,
      error: `Unexpected error: ${error.message || "Unknown error"}`,
      stack: error.stack
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  }
});
