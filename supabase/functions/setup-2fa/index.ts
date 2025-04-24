
// supabase/functions/setup-2fa/index.ts
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import * as base32 from 'https://deno.land/std@0.177.0/encoding/base32.ts'
import * as qrcode from 'https://esm.sh/qrcode@1.5.1'

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

    // Generate a random secret
    const secretBuffer = new Uint8Array(20)
    crypto.getRandomValues(secretBuffer)
    const secret = base32.encode(secretBuffer).replace(/=/g, '').toLowerCase()
    
    // Store the secret in the database for verification
    await supabaseClient.rpc('upsert_totp_secret', { 
      p_user_id: user.id, 
      p_totp_secret: secret, 
      p_verified: false 
    })

    // Generate QR code - OTPAuth URL format (for authenticator apps)
    const companyName = 'Community Intelligence'
    const otpauthUrl = `otpauth://totp/${encodeURIComponent(companyName)}:${encodeURIComponent(user.email || user.id)}?secret=${secret}&issuer=${encodeURIComponent(companyName)}`
    const qrCodeDataUrl = await qrcode.toDataURL(otpauthUrl)
    
    return new Response(
      JSON.stringify({
        secret,
        qrCode: qrCodeDataUrl
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error setting up 2FA:', error)
    
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
        
        // This is a simplified version - in a real implementation, 
        // we would verify the JWT token properly
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
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify(params)
        })
        
        if (!response.ok) throw new Error(`RPC call to ${func} failed`)
        
        return { data: await response.json(), error: null }
      } catch (error) {
        return { data: null, error }
      }
    }
  }
}
