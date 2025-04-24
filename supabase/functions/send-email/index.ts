
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  // Check for authorization header
  const authHeader = req.headers.get('authorization');
  const apiKey = req.headers.get('apikey');
  
  if (!authHeader && !apiKey) {
    console.error("Missing authorization header");
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

  try {
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
      throw error;
    }

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
