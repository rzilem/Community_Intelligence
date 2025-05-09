
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { createLogger } from "../shared/logging.ts";

// CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  const requestId = crypto.randomUUID();
  const logger = createLogger('test-openai');
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    await logger.info(requestId, "Test OpenAI function called");
    
    // Create a Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Get the OpenAI API key from system_settings
    const { data: settings, error: settingsError } = await supabase
      .from('system_settings')
      .select('value')
      .eq('key', 'integrations')
      .single();
    
    if (settingsError) {
      await logger.error(requestId, "Error fetching OpenAI integration settings:", { error: settingsError });
      return new Response(JSON.stringify({ 
        success: false, 
        error: `Failed to retrieve OpenAI settings: ${settingsError.message}` 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    const openAIConfig = settings?.value?.integrationSettings?.OpenAI || {};
    const apiKey = openAIConfig.apiKey;
    const model = openAIConfig.model || 'gpt-4o-mini';
    
    if (!apiKey) {
      await logger.error(requestId, "OpenAI API key not found in settings");
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'OpenAI API key not configured' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    // Test the OpenAI connection with a simple request
    await logger.info(requestId, "Testing OpenAI connection", { model });
    
    try {
      // Make a request to OpenAI
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: model,
          messages: [{ role: 'user', content: 'Say "Hello from Community Intelligence!" and nothing else.' }],
          max_tokens: 30,
          temperature: 0.1,
        }),
      });
      
      const responseData = await response.json();
      
      if (!response.ok) {
        await logger.error(requestId, "OpenAI API error", { 
          status: response.status,
          statusText: response.statusText,
          error: responseData 
        });
        
        return new Response(JSON.stringify({ 
          success: false, 
          error: `OpenAI API error: ${responseData.error?.message || response.statusText}` 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      const content = responseData.choices[0]?.message?.content?.trim();
      await logger.info(requestId, "OpenAI test successful", { content });
      
      return new Response(JSON.stringify({ 
        success: true, 
        response: content,
        model: model
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
      
    } catch (apiError) {
      await logger.error(requestId, "Error making OpenAI API request", { error: apiError });
      return new Response(JSON.stringify({ 
        success: false, 
        error: `Error making request to OpenAI: ${(apiError as Error).message}` 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
  } catch (error) {
    await logger.error(requestId, "Unexpected error in test-openai function", { error });
    
    return new Response(JSON.stringify({ 
      success: false, 
      error: `Unexpected error: ${(error as Error).message}` 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
