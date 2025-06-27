
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

    const { leadId, content, emailData } = await req.json()

    // Get lead data if processing existing lead
    let lead = null
    if (leadId) {
      const { data: leadData, error: leadError } = await supabaseClient
        .from('leads')
        .select('*')
        .eq('id', leadId)
        .single()

      if (leadError || !leadData) {
        return new Response(
          JSON.stringify({ error: 'Lead not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      lead = leadData
    }

    // Prepare content for AI processing
    const processContent = content || emailData?.body || emailData?.html || lead?.notes || ''

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
            content: `You are an expert lead processing assistant for HOA management companies. Extract structured lead information from email content and return it as valid JSON.

Return data in this exact format:
{
  "company_name": "company or organization name",
  "contact_name": "primary contact person name",
  "email": "email address",
  "phone": "phone number",
  "address": "property or business address",
  "city": "city",
  "state": "state",
  "zip": "zip code",
  "source": "website|referral|email|phone|other",
  "lead_type": "new_hoa|management_transfer|consulting|maintenance|other",
  "property_type": "single_family|townhome|condo|mixed|commercial",
  "unit_count": "estimated number of units",
  "current_management": "current management company if mentioned",
  "interest_level": "high|medium|low",
  "timeline": "immediate|3_months|6_months|1_year|unknown",
  "services_needed": ["management", "accounting", "maintenance", "consulting"],
  "budget_range": "estimated budget range",
  "notes": "key points and requirements mentioned",
  "confidence_scores": {
    "company_name": 0.95,
    "contact_name": 0.90,
    "email": 0.95,
    "phone": 0.85,
    "lead_type": 0.80,
    "property_type": 0.75,
    "interest_level": 0.70
  },
  "processing_notes": "any important notes about the extraction"
}`
          },
          {
            role: 'user',
            content: `Please extract structured lead data from this content:

${emailData ? `
Email From: ${emailData.from || 'Not specified'}
Email Subject: ${emailData.subject || 'Not specified'}
Email Content:
` : ''}${processContent}

${lead ? `
Current lead data (if any):
- Company: ${lead.company_name || 'Not specified'}
- Contact: ${lead.contact_name || 'Not specified'}
- Email: ${lead.email || 'Not specified'}
- Phone: ${lead.phone || 'Not specified'}
- Status: ${lead.status || 'Not specified'}
` : ''}

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

    if (leadId && lead) {
      // Update existing lead
      const updateData = {
        company_name: extractedData.company_name || lead.company_name,
        contact_name: extractedData.contact_name || lead.contact_name,
        email: extractedData.email || lead.email,
        phone: extractedData.phone || lead.phone,
        address: extractedData.address || lead.address,
        city: extractedData.city || lead.city,
        state: extractedData.state || lead.state,
        zip: extractedData.zip || lead.zip,
        source: extractedData.source || lead.source,
        lead_type: extractedData.lead_type || lead.lead_type,
        property_type: extractedData.property_type || lead.property_type,
        unit_count: extractedData.unit_count || lead.unit_count,
        current_management: extractedData.current_management || lead.current_management,
        interest_level: extractedData.interest_level || lead.interest_level,
        timeline: extractedData.timeline || lead.timeline,
        services_needed: extractedData.services_needed || lead.services_needed,
        budget_range: extractedData.budget_range || lead.budget_range,
        notes: extractedData.notes || lead.notes,
        ai_confidence: extractedData.confidence_scores || {},
        ai_generated_fields: Object.keys(extractedData.confidence_scores || {}),
        updated_at: new Date().toISOString()
      }

      const { error: updateError } = await supabaseClient
        .from('leads')
        .update(updateData)
        .eq('id', leadId)

      if (updateError) {
        return new Response(
          JSON.stringify({ error: 'Failed to update lead' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        extractedData,
        processing_notes: extractedData.processing_notes,
        leadId: leadId || null
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
