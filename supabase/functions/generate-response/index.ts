
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"
import { createLogger } from "../shared/logging.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')
const logger = createLogger('generate-response')

serve(async (req) => {
  const requestId = crypto.randomUUID()
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    await logger.info(requestId, 'Processing request')
    
    if (!OPENAI_API_KEY) {
      await logger.error(requestId, 'OpenAI API key not configured')
      return new Response(
        JSON.stringify({ error: 'OpenAI API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { requestData } = await req.json()
    
    await logger.info(requestId, 'Request parsed successfully', {
      requestType: requestData?.type,
      requestId: requestData?.id
    })

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: [
          {
            role: 'system',
            content: 'You are a professional HOA management assistant. Generate courteous, helpful, and professional responses to homeowner requests. Your responses should be clear, empathetic, and provide actionable next steps when appropriate.'
          },
          {
            role: 'user',
            content: `Please generate a professional response to this homeowner request:
              
Title: ${requestData.title || 'N/A'}
Description: ${requestData.description || 'N/A'}
Type: ${requestData.type || 'N/A'}
Status: ${requestData.status || 'N/A'}
Priority: ${requestData.priority || 'N/A'}

Please provide a response that:
- Acknowledges the homeowner's concern
- Is professional and empathetic
- Provides clear next steps or information
- Maintains a helpful tone throughout`
          }
        ],
        temperature: 0.7,
        max_tokens: 500,
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
        JSON.stringify({ error: errorMessage }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    const generatedText = data.choices[0].message.content

    await logger.info(requestId, 'Response generated successfully', { 
      model: data.model,
      charCount: generatedText.length
    })

    return new Response(
      JSON.stringify({ 
        generatedText,
        model: data.model,
        usage: data.usage 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    await logger.error(requestId, 'Error processing request', {
      error: errorMessage,
      stack: error instanceof Error ? error.stack : undefined
    })

    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
