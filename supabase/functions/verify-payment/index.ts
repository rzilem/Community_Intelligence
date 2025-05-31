
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const { sessionId } = await req.json();

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    // Retrieve session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status === 'paid') {
      const assessmentId = session.metadata?.assessment_id;
      
      if (assessmentId) {
        // Update assessment as paid
        await supabaseClient
          .from('assessments')
          .update({
            payment_status: 'paid',
            paid: true,
            payment_date: new Date().toISOString().split('T')[0],
            total_amount_paid: session.amount_total / 100
          })
          .eq('id', assessmentId);

        // Update payment transaction
        await supabaseClient
          .from('payment_transactions')
          .update({
            status: 'succeeded',
            stripe_payment_intent_id: session.payment_intent,
            stripe_receipt_url: session.payment_intent ? `https://dashboard.stripe.com/payments/${session.payment_intent}` : null
          })
          .eq('stripe_session_id', sessionId);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        paymentStatus: session.payment_status,
        assessmentId: session.metadata?.assessment_id
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error verifying payment:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400
      }
    );
  }
});
