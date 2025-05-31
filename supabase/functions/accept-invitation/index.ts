
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

    const { invitationToken, userData } = await req.json();

    // Get invitation details
    const { data: invitation, error: invitationError } = await supabaseClient
      .from('resident_invitations')
      .select(`
        *,
        associations!inner(id, name),
        properties(id, address, unit_number)
      `)
      .eq('invitation_token', invitationToken)
      .eq('status', 'sent')
      .gte('expires_at', new Date().toISOString())
      .single();

    if (invitationError || !invitation) {
      throw new Error("Invalid or expired invitation");
    }

    // Create user account
    const { data: authData, error: authError } = await supabaseClient.auth.admin.createUser({
      email: invitation.email,
      password: userData.password,
      email_confirm: true,
      user_metadata: {
        first_name: userData.firstName,
        last_name: userData.lastName,
        phone: userData.phone,
        emergency_contact: userData.emergencyContact
      }
    });

    if (authError) {
      throw authError;
    }

    const user = authData.user;

    // Create profile
    await supabaseClient
      .from('profiles')
      .insert({
        id: user.id,
        email: invitation.email,
        first_name: userData.firstName,
        last_name: userData.lastName,
        role: 'resident',
        phone_number: userData.phone
      });

    // Create resident record
    await supabaseClient
      .from('residents')
      .insert({
        user_id: user.id,
        property_id: invitation.property_id,
        resident_type: 'owner',
        is_primary: true,
        name: `${userData.firstName} ${userData.lastName}`,
        email: invitation.email,
        phone: userData.phone,
        emergency_contact: userData.emergencyContact,
        move_in_date: new Date().toISOString().split('T')[0]
      });

    // Add user to association
    await supabaseClient
      .from('association_users')
      .insert({
        association_id: invitation.association_id,
        user_id: user.id,
        role: 'resident'
      });

    // Mark invitation as accepted
    await supabaseClient
      .from('resident_invitations')
      .update({
        status: 'accepted',
        accepted_at: new Date().toISOString(),
        accepted_by: user.id
      })
      .eq('id', invitation.id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Account created successfully",
        associationName: invitation.associations.name
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error accepting invitation:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400
      }
    );
  }
});
