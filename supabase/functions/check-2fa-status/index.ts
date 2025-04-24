
// supabase/functions/check-2fa-status/index.ts
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    // Get the user from the auth header
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check if 2FA is enabled
    const { data: statusData, error: statusError } = await supabaseClient.rpc('check_totp_status', { 
      p_user_id: user.id
    })

    if (statusError) {
      return new Response(
        JSON.stringify({ error: statusError.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ enabled: statusData.enabled }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error checking 2FA status:', error)
    
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

// Helper function to create authenticated Supabase client
function createClient(supabaseUrl: string, supabaseKey: string, options: any) {
  return {
    auth: {
      getUser: async () => {
        // Extract token from Authorization header
        const authHeader = options.global.headers.Authorization
        if (!authHeader) {
          return { data: { user: null }, error: new Error('No authorization header') }
        }
        
        const token = authHeader.replace('Bearer ', '')
        
        try {
          // Call Supabase API to get user from token
          const response = await fetch(`${supabaseUrl}/auth/v1/user`, {
            headers: {
              Authorization: `Bearer ${token}`,
              apikey: supabaseKey
            }
          })
          
          if (!response.ok) throw new Error('Failed to get user')
          
          const userData = await response.json()
          return { data: { user: userData }, error: null }
        } catch (error) {
          return { data: { user: null }, error }
        }
      }
    },
    rpc: async (func: string, params: any) => {
      try {
        const response = await fetch(`${supabaseUrl}/rest/v1/rpc/${func}`, {
          method: 'POST',
          headers: {
            Authorization: options.global.headers.Authorization,
            apikey: supabaseKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(params)
        })
        
        if (!response.ok) throw new Error(`RPC call to ${func} failed`)
        
        const data = await response.json()
        return { data, error: null }
      } catch (error) {
        return { data: null, error }
      }
    }
  }
}
