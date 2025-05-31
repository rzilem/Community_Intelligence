
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
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

    const { email, associationId, propertyId, message } = await req.json();

    // Generate secure invitation token
    const invitationToken = crypto.randomUUID();

    // Create invitation record
    const { data: invitation, error: invitationError } = await supabaseClient
      .from('resident_invitations')
      .insert({
        association_id: associationId,
        property_id: propertyId,
        email: email,
        invited_by: user.id,
        invitation_token: invitationToken,
        metadata: { message }
      })
      .select()
      .single();

    if (invitationError) {
      throw invitationError;
    }

    // Get association and property details for email
    const { data: association } = await supabaseClient
      .from('associations')
      .select('name')
      .eq('id', associationId)
      .single();

    const { data: property } = await supabaseClient
      .from('properties')
      .select('address, unit_number')
      .eq('id', propertyId)
      .maybeSingle();

    // Send invitation email using Resend
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      throw new Error("Resend API key not configured");
    }

    const invitationUrl = `${req.headers.get("origin")}/invitation/${invitationToken}`;
    
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>You're Invited to Join ${association?.name}</h2>
        <p>Hello,</p>
        <p>You've been invited to join the Community Intelligence platform for ${association?.name}.</p>
        ${property ? `<p><strong>Property:</strong> ${property.address}${property.unit_number ? ` Unit ${property.unit_number}` : ''}</p>` : ''}
        ${message ? `<p><strong>Message from Admin:</strong> ${message}</p>` : ''}
        <p>To complete your registration, click the link below:</p>
        <a href="${invitationUrl}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Accept Invitation</a>
        <p>This invitation will expire in 7 days.</p>
        <p>If you have any questions, please contact your HOA administrator.</p>
      </div>
    `;

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Community Intelligence <noreply@yourdomain.com>",
        to: [email],
        subject: `Invitation to Join ${association?.name}`,
        html: emailHtml,
      }),
    });

    if (!emailResponse.ok) {
      throw new Error("Failed to send invitation email");
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        invitationId: invitation.id,
        message: "Invitation sent successfully" 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error sending invitation:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400
      }
    );
  }
});
