
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }
  
  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )
    
    const { userData, associationId } = await req.json()
    
    if (!userData || !userData.email || !associationId) {
      return new Response(
        JSON.stringify({ error: 'Missing required data' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      )
    }
    
    // First check if user exists in auth
    const { data: existingAuthUser, error: authError } = await supabaseClient.auth.admin.getUserByEmail(
      userData.email
    )
    
    let userId
    
    if (existingAuthUser) {
      userId = existingAuthUser.id
    } else {
      // Create the user in auth
      const { data: newUser, error: createError } = await supabaseClient.auth.admin.createUser({
        email: userData.email,
        email_confirm: true,
        user_metadata: {
          first_name: userData.first_name,
          last_name: userData.last_name
        }
      })
      
      if (createError) {
        throw createError
      }
      
      userId = newUser.user.id
    }
    
    // Check if profile exists
    const { data: existingProfile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    
    let profile
    
    if (existingProfile) {
      profile = existingProfile
    } else {
      // Create the profile if it doesn't exist
      const { data: newProfile, error: insertError } = await supabaseClient
        .from('profiles')
        .insert({
          id: userId,
          first_name: userData.first_name,
          last_name: userData.last_name,
          email: userData.email,
          role: userData.role
        })
        .select()
        .single()
      
      if (insertError) {
        throw insertError
      }
      
      profile = newProfile
    }
    
    // Add to association
    const { data: associationUser, error: assocError } = await supabaseClient
      .from('association_users')
      .insert({
        user_id: userId,
        association_id: associationId,
        role: userData.role
      })
      .select()
      .single()
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        profile,
        association: associationUser
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})
