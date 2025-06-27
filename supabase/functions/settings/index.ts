
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
}

serve(async (req) => {
  console.log(`Settings function called: ${req.method} ${req.url}`)
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      headers: corsHeaders,
      status: 200 
    });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get the JWT token from the Authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      console.error('No authorization header found')
      return new Response(
        JSON.stringify({ success: false, error: 'Authentication required' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401 
        }
      )
    }

    // Set the auth context for the supabase client
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token)
    
    if (userError || !user) {
      console.error('Authentication failed:', userError)
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid authentication' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401 
        }
      )
    }

    console.log(`Authenticated user: ${user.id}`)

    // Check if user has admin role
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const isAdmin = profile?.role === 'admin' || profile?.role === 'super_admin'
    console.log(`User admin status: ${isAdmin}`)

    if (!isAdmin) {
      return new Response(
        JSON.stringify({ success: false, error: 'Admin access required' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 403 
        }
      )
    }

    const url = new URL(req.url)
    const settingKey = url.pathname.split('/').pop()
    
    console.log(`Processing request for setting key: ${settingKey}`)

    if (req.method === 'GET') {
      // Handle GET requests for specific setting keys
      if (!settingKey || settingKey === 'settings') {
        return new Response(
          JSON.stringify({ success: false, error: 'Setting key is required' }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400 
          }
        )
      }

      console.log(`Fetching setting: ${settingKey}`)
      
      const { data, error } = await supabaseClient
        .from('system_settings')
        .select('value')
        .eq('key', settingKey)
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
        console.error('Database error fetching setting:', error)
        return new Response(
          JSON.stringify({ success: false, error: 'Database error' }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500 
          }
        )
      }

      // Return the setting value or default based on key
      const defaultSettings = {
        appearance: {
          theme: 'system',
          colorScheme: 'default',
          density: 'default',
          animationsEnabled: true,
          fontScale: 1,
          showAuthDebugger: false
        },
        notifications: {
          emailNotifications: true,
          pushNotifications: true,
          smsNotifications: false,
          maintenanceAlerts: true,
          securityAlerts: true,
          newsAndUpdates: false
        },
        security: {
          twoFactorAuth: false,
          sessionTimeout: 30,
          passwordResetInterval: 90,
          ipWhitelist: ['192.168.1.1', '10.0.0.1']
        },
        preferences: {
          defaultAssociationId: 'assoc-1',
          defaultDateFormat: 'MM/DD/YYYY',
          defaultTimeFormat: '12h',
          defaultCurrency: 'USD',
          defaultLanguage: 'en',
          autoSave: true
        },
        integrations: {
          integrationSettings: {}
        },
        webhook_settings: {
          cloudmailin_webhook_url: '',
          cloudmailin_secret: '',
          webhook_secret: ''
        }
      }

      const settingValue = data?.value || defaultSettings[settingKey as keyof typeof defaultSettings] || {}
      
      console.log(`Returning setting value for ${settingKey}:`, settingValue)
      
      return new Response(
        JSON.stringify({ success: true, data: settingValue }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      )
    }

    if (req.method === 'POST' || req.method === 'PUT') {
      // Handle POST/PUT requests for updating settings
      if (!settingKey || settingKey === 'settings') {
        return new Response(
          JSON.stringify({ success: false, error: 'Setting key is required' }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400 
          }
        )
      }

      let requestBody
      try {
        const bodyText = await req.text()
        console.log(`Request body text: ${bodyText}`)
        
        if (!bodyText || bodyText.trim() === '') {
          throw new Error('Empty request body')
        }
        
        requestBody = JSON.parse(bodyText)
        console.log(`Parsed request body:`, requestBody)
      } catch (error) {
        console.error('Error parsing request body:', error)
        return new Response(
          JSON.stringify({ success: false, error: 'Invalid JSON in request body' }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400 
          }
        )
      }

      console.log(`Updating setting ${settingKey} with value:`, requestBody)

      // Update the setting in the database
      const { error: updateError } = await supabaseClient
        .from('system_settings')
        .upsert({
          key: settingKey,
          value: requestBody,
          updated_at: new Date().toISOString()
        })

      if (updateError) {
        console.error('Database error updating setting:', updateError)
        return new Response(
          JSON.stringify({ success: false, error: 'Failed to update setting' }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500 
          }
        )
      }

      console.log(`Successfully updated setting: ${settingKey}`)
      
      return new Response(
        JSON.stringify({ success: true, message: 'Setting updated successfully' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      )
    }

    // Method not allowed
    return new Response(
      JSON.stringify({ success: false, error: 'Method not allowed' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 405 
      }
    )

  } catch (error) {
    console.error('Unexpected error in settings function:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Internal server error',
        details: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})
