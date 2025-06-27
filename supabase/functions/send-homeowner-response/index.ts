
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// CloudMailin SMTP configuration
const SMTP_CONFIG = {
  hostname: 'feedback-smtp.cloudmta.net',
  port: 587,
  username: Deno.env.get('CLOUDMAILIN_USERNAME') || '',
  password: Deno.env.get('CLOUDMAILIN_PASSWORD') || '',
  from: 'noreply@hoamanagersoftware.com'
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { requestId, recipientEmail, subject, htmlContent, plainTextContent } = await req.json()

    // Get the request details
    const { data: request, error: requestError } = await supabaseClient
      .from('homeowner_requests')
      .select('*')
      .eq('id', requestId)
      .single()

    if (requestError || !request) {
      return new Response(
        JSON.stringify({ error: 'Request not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Send email using CloudMailin SMTP
    const emailPayload = {
      from: SMTP_CONFIG.from,
      to: recipientEmail,
      subject: subject,
      html: htmlContent,
      text: plainTextContent || stripHtml(htmlContent),
      headers: {
        'In-Reply-To': request.tracking_number,
        'References': request.tracking_number
      }
    }

    // Use CloudMailin's HTTP API for sending (more reliable than SMTP in edge functions)
    const cloudmailinResponse = await fetch('https://api.cloudmailin.com/api/v0.1/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('CLOUDMAILIN_API_KEY')}`
      },
      body: JSON.stringify(emailPayload)
    })

    if (!cloudmailinResponse.ok) {
      const errorText = await cloudmailinResponse.text()
      console.error('CloudMailin API error:', errorText)
      return new Response(
        JSON.stringify({ error: 'Failed to send email' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Log the response in the database
    const { error: logError } = await supabaseClient
      .from('homeowner_request_responses')
      .insert({
        request_id: requestId,
        response_content: htmlContent,
        response_method: 'email',
        sent_to: recipientEmail,
        sent_by: Deno.env.get('USER_ID'),
        sent_at: new Date().toISOString()
      })

    if (logError) {
      console.error('Error logging response:', logError)
    }

    // Update request status if needed
    const { error: updateError } = await supabaseClient
      .from('homeowner_requests')
      .update({ 
        status: 'in-progress',
        updated_at: new Date().toISOString()
      })
      .eq('id', requestId)

    if (updateError) {
      console.error('Error updating request status:', updateError)
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Response sent successfully' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in send-homeowner-response:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim()
}
