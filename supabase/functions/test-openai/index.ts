
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.47.0";

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
    console.log("Testing OpenAI connection...");
    
    // Create a Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // First, get the OpenAI API key from system settings
    const { data: settings, error: settingsError } = await supabase
      .from('system_settings')
      .select('value')
      .eq('key', 'integrations')
      .single();
    
    if (settingsError) {
      console.error("Error fetching OpenAI settings:", settingsError);
      return new Response(JSON.stringify({ 
        success: false,
        error: 'Could not retrieve API settings: ' + settingsError.message 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    // Extract the OpenAI API key
    const openAISettings = settings?.value?.integrationSettings?.OpenAI;
    const apiKey = openAISettings?.apiKey;
    
    if (!apiKey) {
      console.error("No OpenAI API key configured");
      return new Response(JSON.stringify({ 
        success: false,
        error: 'No OpenAI API key configured' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    // Test OpenAI connection using a simple models list request
    const openAIResponse = await fetch('https://api.openai.com/v1/models', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });
    
    const openAIData = await openAIResponse.json();
    
    if (!openAIResponse.ok) {
      console.error("OpenAI API test failed:", openAIData);
      return new Response(JSON.stringify({ 
        success: false,
        error: openAIData.error?.message || 'API request failed' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    // If we got here, the connection was successful
    return new Response(JSON.stringify({ 
      success: true,
      message: 'OpenAI connection successful',
      modelCount: openAIData.data?.length || 0
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error("Error testing OpenAI connection:", error);
    
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message || 'An unexpected error occurred'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
