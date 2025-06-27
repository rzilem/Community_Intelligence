
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    if (!OPENAI_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'OpenAI API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    const { invoiceId, content, reprocess = false } = await req.json()

    // Get invoice data
    const { data: invoice, error: invoiceError } = await supabaseClient
      .from('invoices')
      .select('*')
      .eq('id', invoiceId)
      .single()

    if (invoiceError || !invoice) {
      return new Response(
        JSON.stringify({ error: 'Invoice not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Prepare content for AI processing
    const processContent = content || invoice.email_content || invoice.html_content || invoice.description || ''

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
            content: `You are an expert invoice processing assistant. Extract structured data from invoice content and return it as valid JSON. Focus on accuracy and provide confidence scores.

Return data in this exact format:
{
  "vendor": "vendor name",
  "invoice_number": "invoice number",
  "amount": "total amount as number",
  "due_date": "YYYY-MM-DD format",
  "invoice_date": "YYYY-MM-DD format", 
  "description": "brief description of services/products",
  "line_items": [
    {
      "description": "item description",
      "quantity": 1,
      "unit_price": 0.00,
      "total": 0.00
    }
  ],
  "confidence_scores": {
    "vendor": 0.95,
    "invoice_number": 0.90,
    "amount": 0.85,
    "due_date": 0.80,
    "invoice_date": 0.90,
    "description": 0.85
  },
  "processing_notes": "any important notes about the extraction"
}`
          },
          {
            role: 'user',
            content: `Please extract structured data from this invoice content:

${processContent}

Current invoice data (if any):
- Vendor: ${invoice.vendor || 'Not specified'}
- Amount: ${invoice.amount || 'Not specified'}
- Invoice Number: ${invoice.invoice_number || 'Not specified'}
- Due Date: ${invoice.due_date || 'Not specified'}

Please analyze and extract the most accurate information possible.`
          }
        ],
        temperature: 0.3,
        max_tokens: 1500,
      }),
    })

    const data = await response.json()
    
    if (!response.ok) {
      return new Response(
        JSON.stringify({ error: data.error?.message || 'OpenAI API error' }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    let extractedData
    try {
      extractedData = JSON.parse(data.choices[0].message.content)
    } catch (parseError) {
      return new Response(
        JSON.stringify({ error: 'Failed to parse AI response' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Update invoice with extracted data
    const updateData = {
      vendor: extractedData.vendor || invoice.vendor,
      invoice_number: extractedData.invoice_number || invoice.invoice_number,
      amount: extractedData.amount || invoice.amount,
      due_date: extractedData.due_date || invoice.due_date,
      invoice_date: extractedData.invoice_date || invoice.invoice_date,
      description: extractedData.description || invoice.description,
      ai_confidence: extractedData.confidence_scores || {},
      ai_line_items: extractedData.line_items || [],
      ai_processing_status: 'completed',
      ai_processed_at: new Date().toISOString()
    }

    const { error: updateError } = await supabaseClient
      .from('invoices')
      .update(updateData)
      .eq('id', invoiceId)

    if (updateError) {
      return new Response(
        JSON.stringify({ error: 'Failed to update invoice' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        extractedData,
        processing_notes: extractedData.processing_notes
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
