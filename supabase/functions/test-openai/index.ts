
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
    
    console.log("Fetching OpenAI settings from database...");
    
    // Get the OpenAI API key from system settings
    const { data: settings, error: settingsError } = await supabase
      .from('system_settings')
      .select('value')
      .eq('key', 'integrations')
      .single();
      
    if (settingsError) {
      console.error("Settings fetch error:", settingsError);
      throw new Error(`Failed to fetch OpenAI settings: ${settingsError.message}`);
    }
    
    console.log("Settings data retrieved:", JSON.stringify(settings));
    
    const integrations = settings?.value?.integrationSettings || {};
    const openAIConfig = integrations['OpenAI'];
    
    if (!openAIConfig || !openAIConfig.apiKey) {
      console.error("No OpenAI configuration found");
      throw new Error('OpenAI API key not configured');
    }
    
    console.log("OpenAI config found, attempting API call...");
    
    // Attempt to call OpenAI API with a simple request
    const openAIModel = openAIConfig.model || 'gpt-4o-mini';
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIConfig.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: openAIModel,
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant.'
          },
          {
            role: 'user',
            content: 'Hello! Is this connection working?'
          }
        ],
        max_tokens: 50
      })
    });
    
    const data = await response.json();
    
    if (data.error) {
      console.error("OpenAI API error:", data.error);
      throw new Error(`OpenAI API error: ${data.error.message}`);
    }
    
    console.log("OpenAI response successful");
    
    return new Response(JSON.stringify({
      success: true,
      message: "OpenAI connection successful",
      response: data.choices[0].message.content,
      model: openAIModel
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
    
  } catch (error) {
    console.error('Error testing OpenAI connection:', error);
    
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message || 'An unexpected error occurred' 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
