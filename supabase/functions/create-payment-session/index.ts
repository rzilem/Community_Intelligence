
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

    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data: { user } } = await supabaseClient.auth.getUser(token);

    if (!user) {
      throw new Error("Unauthorized");
    }

    const { assessmentId } = await req.json();

    // Get assessment details
    const { data: assessment, error: assessmentError } = await supabaseClient
      .from('assessments')
      .select(`
        *,
        properties!inner(id, address, unit_number, association_id),
        assessment_types(name),
        residents!inner(id, name, email)
      `)
      .eq('id', assessmentId)
      .eq('residents.user_id', user.id)
      .single();

    if (assessmentError || !assessment) {
      throw new Error("Assessment not found or unauthorized");
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    // Check for existing Stripe customer
    const customers = await stripe.customers.list({
      email: user.email,
      limit: 1,
    });

    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `${assessment.assessment_types?.name || 'Assessment'} - ${assessment.properties.address}`,
              description: `Payment for ${assessment.properties.address}${assessment.properties.unit_number ? ` Unit ${assessment.properties.unit_number}` : ''}`,
            },
            unit_amount: Math.round(assessment.amount * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${req.headers.get("origin")}/payment-success?assessment_id=${assessmentId}`,
      cancel_url: `${req.headers.get("origin")}/billing`,
      metadata: {
        assessment_id: assessmentId,
        user_id: user.id,
        association_id: assessment.properties.association_id,
      },
    });

    // Create payment transaction record
    await supabaseClient
      .from('payment_transactions')
      .insert({
        assessment_id: assessmentId,
        association_id: assessment.properties.association_id,
        property_id: assessment.properties.id,
        resident_id: assessment.residents.id,
        stripe_session_id: session.id,
        amount: assessment.amount,
        status: 'pending'
      });

    // Update assessment with payment URL
    await supabaseClient
      .from('assessments')
      .update({
        payment_status: 'pending',
        payment_url: session.url,
        stripe_session_id: session.id
      })
      .eq('id', assessmentId);

    return new Response(
      JSON.stringify({ url: session.url }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error creating payment session:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400
      }
    );
  }
});
