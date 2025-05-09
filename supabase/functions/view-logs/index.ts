
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client with service role key
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    
    if (!supabaseUrl || !supabaseKey) {
      return new Response(
        JSON.stringify({ error: 'Supabase credentials not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey)
    
    // Parse parameters from both URL and request body
    const url = new URL(req.url)
    
    // Get parameters from URL query string
    let functionName = url.searchParams.get('function') || undefined
    let level = url.searchParams.get('level') || undefined
    let limit = parseInt(url.searchParams.get('limit') || '100')
    let offset = parseInt(url.searchParams.get('offset') || '0')
    let startDate = url.searchParams.get('startDate') || undefined
    let endDate = url.searchParams.get('endDate') || undefined
    
    // If the request has a body, check for parameters there too (takes precedence)
    if (req.headers.get('content-type')?.includes('application/json')) {
      try {
        const body = await req.json()
        
        // Override URL parameters with body parameters if present
        functionName = body.function !== undefined ? body.function : functionName
        level = body.level !== undefined ? body.level : level
        limit = body.limit !== undefined ? parseInt(body.limit) : limit
        offset = body.offset !== undefined ? parseInt(body.offset) : offset
        startDate = body.startDate !== undefined ? body.startDate : startDate
        endDate = body.endDate !== undefined ? body.endDate : endDate
      } catch (e) {
        console.error('Error parsing JSON body:', e)
        // Continue with URL parameters if body parsing fails
      }
    }
    
    // Build query
    let query = supabase
      .from('function_logs')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(limit)
      .range(offset, offset + limit - 1)
    
    // Add filters if provided
    if (functionName) {
      query = query.eq('function_name', functionName)
    }
    
    if (level) {
      query = query.eq('level', level)
    }
    
    if (startDate) {
      query = query.gte('timestamp', startDate)
    }
    
    if (endDate) {
      query = query.lte('timestamp', endDate)
    }
    
    // Execute query
    const { data, error, count } = await query

    if (error) {
      console.error('Error fetching logs:', error)
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get available function names for filtering
    const { data: functionNames } = await supabase
      .from('function_logs')
      .select('function_name')
      .distinct()
    
    // Return logs with pagination info
    return new Response(
      JSON.stringify({
        logs: data,
        pagination: {
          limit,
          offset,
          total: count
        },
        filters: {
          availableFunctions: functionNames?.map(item => item.function_name) || []
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
