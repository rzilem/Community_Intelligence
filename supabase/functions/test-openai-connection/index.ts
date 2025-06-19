
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

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
    const { apiKey, model = 'gpt-4o-mini', testPrompt } = await req.json();

    if (!apiKey) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'API key is required' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      });
    }

    const prompt = testPrompt || 'Hello! Please respond with "OpenAI connection successful" to confirm the API is working.';

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model,
        messages: [
          { 
            role: 'system', 
            content: 'You are testing an API connection. Respond concisely to confirm the connection is working.' 
          },
          { role: 'user', content: prompt }
        ],
        max_tokens: 50,
        temperature: 0.1
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: { message: 'Unknown API error' } }));
      const errorMessage = errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`;
      
      return new Response(JSON.stringify({ 
        success: false, 
        error: errorMessage 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      });
    }

    const data = await response.json();
    const responseText = data.choices?.[0]?.message?.content?.trim() || 'No response received';

    return new Response(JSON.stringify({ 
      success: true, 
      response: responseText,
      model: model,
      usage: data.usage || null
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    });

  } catch (error) {
    console.error('Test OpenAI connection error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    });
  }
});
