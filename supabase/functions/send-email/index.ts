
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, *',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Determine if this is a webhook request, internal app request, or external request
    const isWebhookRequest = 
      req.headers.get('x-webhook-source') === 'true' || 
      req.headers.get('x-cloudmailin-event') !== null ||
      req.headers.get('user-agent')?.includes('CloudMailin') ||
      req.headers.get('user-agent')?.includes('webhook');
    
    // Only verify auth for non-webhook requests
    const authHeader = req.headers.get('authorization');
    const apiKey = req.headers.get('apikey');
    
    // Skip authentication check for webhook sources
    if (!isWebhookRequest && !authHeader && !apiKey) {
      console.error("Missing authorization header for non-webhook request");
      return new Response(
        JSON.stringify({ 
          code: 401,
          message: "Missing authorization header" 
        }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 401 
        }
      );
    }

    console.log("Processing email send request");
    console.log("Is webhook request:", isWebhookRequest);
    
    const { 
      to, 
      subject, 
      html, 
      from = 'info@hoamanagersoftware.com' 
    } = await req.json();

    const { data, error } = await resend.emails.send({
      from: from,
      to: to,
      subject: subject,
      html: html,
    });

    if (error) {
      console.error("Error sending email with Resend:", error);
      throw error;
    }

    console.log("Email sent successfully:", data);
    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error("Error in send-email function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
