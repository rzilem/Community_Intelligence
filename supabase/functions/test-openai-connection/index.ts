
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
    console.log('Test OpenAI connection function called');
    
    const { apiKey, model = 'gpt-4o-mini', testPrompt } = await req.json();
    console.log('Request data:', { hasApiKey: !!apiKey, model, hasPrompt: !!testPrompt });

    if (!apiKey) {
      console.error('No API key provided');
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'API key is required' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      });
    }

    const prompt = testPrompt || 'Hello! Please respond with "OpenAI connection successful" to confirm the API is working.';
    console.log('Making request to OpenAI with model:', model);

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

    console.log('OpenAI response status:', response.status, response.statusText);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ 
        error: { 
          message: `HTTP ${response.status}: ${response.statusText}` 
        } 
      }));
      
      const errorMessage = errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`;
      console.error('OpenAI API error:', errorMessage, 'Full response:', errorData);
      
      return new Response(JSON.stringify({ 
        success: false, 
        error: errorMessage 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      });
    }

    const data = await response.json();
    console.log('OpenAI response data:', data);
    
    const responseText = data.choices?.[0]?.message?.content?.trim() || 'No response received';

    console.log('Test successful, response:', responseText);
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
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return new Response(JSON.stringify({ 
      success: false, 
      error: errorMessage 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    });
  }
});
