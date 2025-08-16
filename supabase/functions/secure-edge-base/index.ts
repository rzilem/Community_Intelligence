import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { SecurityMiddleware } from '../shared/security-middleware.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-webhook-signature',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Apply security middleware
    const clientIp = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    
    // Rate limiting
    if (!SecurityMiddleware.checkRateLimit(clientIp)) {
      SecurityMiddleware.logSecurityEvent('rate_limit_exceeded', { ip: clientIp });
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded' }),
        { status: 429, headers: { ...corsHeaders, ...SecurityMiddleware.getSecurityHeaders() } }
      );
    }

    // Header validation
    const headerValidation = SecurityMiddleware.validateHeaders(req);
    if (!headerValidation.valid) {
      SecurityMiddleware.logSecurityEvent('invalid_headers', { 
        ip: clientIp, 
        error: headerValidation.error 
      });
      return new Response(
        JSON.stringify({ error: 'Invalid headers' }),
        { status: 400, headers: { ...corsHeaders, ...SecurityMiddleware.getSecurityHeaders() } }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get and validate auth token
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Missing or invalid authorization header' }),
        { status: 401, headers: { ...corsHeaders, ...SecurityMiddleware.getSecurityHeaders() } }
      );
    }

    // Verify JWT token
    const jwt = authHeader.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(jwt);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, ...SecurityMiddleware.getSecurityHeaders() } }
      );
    }

    // Parse and sanitize request body
    let body = null;
    if (req.method === 'POST') {
      try {
        const rawBody = await req.text();
        body = JSON.parse(rawBody);
        body = SecurityMiddleware.sanitizeRequestBody(body);
      } catch (error) {
        return new Response(
          JSON.stringify({ error: 'Invalid JSON body' }),
          { status: 400, headers: { ...corsHeaders, ...SecurityMiddleware.getSecurityHeaders() } }
        );
      }
    }

    // Your secure business logic goes here
    const result = {
      message: 'Secure endpoint accessed successfully',
      user_id: user.id,
      timestamp: new Date().toISOString()
    };

    return new Response(
      JSON.stringify(result),
      { 
        status: 200, 
        headers: { 
          ...corsHeaders, 
          ...SecurityMiddleware.getSecurityHeaders(),
          'Content-Type': 'application/json'
        } 
      }
    );

  } catch (error) {
    console.error('Edge function error:', error);
    SecurityMiddleware.logSecurityEvent('suspicious_activity', { 
      error: error.message,
      ip: req.headers.get('x-forwarded-for') || 'unknown'
    });
    
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { 
          ...corsHeaders, 
          ...SecurityMiddleware.getSecurityHeaders() 
        } 
      }
    );
  }
});