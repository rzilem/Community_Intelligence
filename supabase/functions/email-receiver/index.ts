
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { SecurityMiddleware } from "../shared/security-middleware.ts";
import { sanitizeInput, validateEmail } from "../shared/validation-utils.ts";
import { processEmail } from "./services/email-processor.ts";
import { createLead } from "./services/lead-service.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Security validations
    const headerValidation = SecurityMiddleware.validateHeaders(req);
    if (!headerValidation.valid) {
      SecurityMiddleware.logSecurityEvent('invalid_headers', { error: headerValidation.error });
      return new Response(
        JSON.stringify({ error: 'Invalid request headers' }),
        { status: 400, headers: { ...corsHeaders, ...SecurityMiddleware.getSecurityHeaders() } }
      );
    }

    // Rate limiting
    const clientIP = req.headers.get('x-forwarded-for') || 'unknown';
    if (!SecurityMiddleware.checkRateLimit(clientIP)) {
      SecurityMiddleware.logSecurityEvent('rate_limit_exceeded', { ip: clientIP });
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded' }),
        { status: 429, headers: { ...corsHeaders, ...SecurityMiddleware.getSecurityHeaders() } }
      );
    }

    // Validate webhook signature
    const signature = req.headers.get('x-signature') || '';
    const webhookSecret = Deno.env.get('WEBHOOK_SECRET');
    const body = await req.text();
    
    if (webhookSecret && !SecurityMiddleware.validateWebhookSignature(body, signature, webhookSecret)) {
      SecurityMiddleware.logSecurityEvent('invalid_signature', { signature });
      return new Response(
        JSON.stringify({ error: 'Invalid signature' }),
        { status: 401, headers: { ...corsHeaders, ...SecurityMiddleware.getSecurityHeaders() } }
      );
    }

    // Parse and sanitize request body
    let emailData;
    try {
      emailData = JSON.parse(body);
      emailData = SecurityMiddleware.sanitizeRequestBody(emailData);
    } catch (error) {
      console.error('Invalid JSON in request body:', error);
      return new Response(
        JSON.stringify({ error: 'Invalid JSON' }),
        { status: 400, headers: { ...corsHeaders, ...SecurityMiddleware.getSecurityHeaders() } }
      );
    }

    // Validate required email fields
    if (!emailData.from || !validateEmail(emailData.from)) {
      return new Response(
        JSON.stringify({ error: 'Invalid sender email' }),
        { status: 400, headers: { ...corsHeaders, ...SecurityMiddleware.getSecurityHeaders() } }
      );
    }

    if (!emailData.subject || typeof emailData.subject !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Invalid email subject' }),
        { status: 400, headers: { ...corsHeaders, ...SecurityMiddleware.getSecurityHeaders() } }
      );
    }

    // Sanitize email content
    const sanitizedEmail = {
      from: sanitizeInput(emailData.from),
      to: sanitizeInput(emailData.to || ''),
      subject: sanitizeInput(emailData.subject),
      body: sanitizeInput(emailData.body || ''),
      html: emailData.html ? sanitizeInput(emailData.html) : null,
      attachments: Array.isArray(emailData.attachments) ? emailData.attachments.slice(0, 10) : [] // Limit attachments
    };

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Generate tracking number
    const { data: trackingData, error: trackingError } = await supabase.rpc('get_next_tracking_number');
    
    if (trackingError) {
      console.error('Error generating tracking number:', trackingError);
      throw trackingError;
    }

    const trackingNumber = `EMAIL-${trackingData}`;

    // Store in communications log
    const { data: logData, error: logError } = await supabase
      .from('communications_log')
      .insert({
        tracking_number: trackingNumber,
        communication_type: 'email',
        metadata: {
          from: sanitizedEmail.from,
          to: sanitizedEmail.to,
          subject: sanitizedEmail.subject,
          body: sanitizedEmail.body,
          html: sanitizedEmail.html,
          attachments: sanitizedEmail.attachments,
          processed_by: 'email-receiver',
          security_validated: true
        },
        status: 'received'
      })
      .select()
      .single();

    if (logError) {
      console.error('Error storing communication log:', logError);
      throw logError;
    }

    console.log('Email processed successfully:', trackingNumber);

    // Extract lead details from the email and store in the database
    const processedLead = await processEmail(sanitizedEmail);
    const lead = await createLead(processedLead);

    await supabase
      .from('communications_log')
      .update({
        status: 'completed',
        metadata: {
          ...logData.metadata,
          lead_id: lead.id,
          processed_successfully: true
        }
      })
      .eq('tracking_number', trackingNumber);

    return new Response(
      JSON.stringify({
        success: true,
        tracking_number: trackingNumber,
        lead,
        message: 'Email processed successfully'
      }),
      {
        headers: {
          ...corsHeaders,
          ...SecurityMiddleware.getSecurityHeaders(),
          'Content-Type': 'application/json'
        }
      }
    );

  } catch (error) {
    console.error('Error processing email:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: 'Failed to process email'
      }),
      { 
        status: 500, 
        headers: { 
          ...corsHeaders, 
          ...SecurityMiddleware.getSecurityHeaders(),
          'Content-Type': 'application/json'
        } 
      }
    );
  }
});
