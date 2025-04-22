
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
    console.log("Testing OpenAI connection");
    
    // Create a Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Get integration settings from the database
    const { data: settingsData, error: settingsError } = await supabase
      .from('system_settings')
      .select('value')
      .eq('key', 'integrations')
      .single();
      
    if (settingsError) {
      console.error("Error fetching settings:", settingsError);
      throw new Error(`Failed to fetch integration settings: ${settingsError.message}`);
    }
    
    if (!settingsData || !settingsData.value) {
      throw new Error("No integration settings found");
    }
    
    const integrationSettings = settingsData.value.integrationSettings || {};
    const openAIConfig = integrationSettings.OpenAI || {};
    
    if (!openAIConfig.apiKey) {
      throw new Error("No OpenAI API key configured");
    }
    
    // Test the OpenAI API with a simple request
    const openAIApiKey = openAIConfig.apiKey;
    const model = openAIConfig.model || "gpt-4o-mini";
    
    console.log(`Testing OpenAI with model: ${model}`);
    
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${openAIApiKey}`
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: "system",
            content: "You are a helpful assistant."
          },
          {
            role: "user",
            content: "Hello! Please respond with 'Connection to OpenAI is working correctly.'"
          }
        ],
        temperature: 0.1,
        max_tokens: 50
      })
    });
    
    const data = await response.json();
    
    if (response.status !== 200) {
      console.error("OpenAI API error:", data);
      throw new Error(`OpenAI API error: ${data.error?.message || "Unknown error"}`);
    }
    
    const aiResponse = data.choices[0].message.content;
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        response: aiResponse,
        model: model
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error("Error testing OpenAI:", error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || "An error occurred testing the OpenAI connection"
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
