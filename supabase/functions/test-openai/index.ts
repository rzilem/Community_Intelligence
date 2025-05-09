
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"
import { createLogger } from "../shared/logging.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const logger = createLogger('test-openai')

serve(async (req) => {
  const requestId = crypto.randomUUID()
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    await logger.info(requestId, 'Testing OpenAI connection')
    
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY')
    
    if (!openAIApiKey) {
      await logger.error(requestId, 'OpenAI API key not configured')
      return new Response(
        JSON.stringify({
          success: false,
          error: 'OpenAI API key not configured'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { 
            role: 'user', 
            content: 'Please respond with "Connection successful!" to test the API connection. Keep it very short.' 
          }
        ],
        max_tokens: 20
      }),
    })

    const data = await response.json()
    
    if (!response.ok) {
      const errorMessage = data.error?.message || 'Unknown OpenAI API error'
      await logger.error(requestId, 'OpenAI API error', { 
        status: response.status,
        error: errorMessage
      })
      
      return new Response(
        JSON.stringify({
          success: false,
          error: errorMessage
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    const generatedText = data.choices[0].message.content.trim()
    
    await logger.info(requestId, 'OpenAI connection successful', {
      model: data.model,
      response: generatedText
    })

    return new Response(
      JSON.stringify({
        success: true,
        response: generatedText,
        model: data.model
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    await logger.error(requestId, 'Error testing OpenAI connection', {
      error: errorMessage
    })
    
    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
