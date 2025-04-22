
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

  try {
    const { email, name, orderDetails } = await req.json();

    const { data, error } = await resend.emails.send({
      from: 'orders@yourdomain.com',
      to: email,
      subject: 'Your Resale Order Confirmation',
      html: `
        <h1>Thank you for your order, ${name}!</h1>
        <p>We have received your order for the following property:</p>
        <p><strong>Address:</strong> ${orderDetails.address}</p>
        <p><strong>Processing Time:</strong> ${orderDetails.rushOption}</p>
        <p><strong>Closing Date:</strong> ${orderDetails.closingDate}</p>
        <p>We will begin processing your order immediately. You can track your order status in your account dashboard.</p>
      `,
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
