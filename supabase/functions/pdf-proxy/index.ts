
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js';

const enhancedHeaders = {
  ...corsHeaders,
  'Content-Type': 'application/pdf',
  'Content-Disposition': 'inline; filename="document.pdf"',
  'X-Content-Type-Options': 'nosniff',
  'Content-Security-Policy': "default-src * 'unsafe-inline' 'unsafe-eval' data: blob:; connect-src *; img-src * data: blob:; frame-ancestors *;",
  'X-Frame-Options': 'ALLOWALL',
  'Cache-Control': 'no-cache, no-store, must-revalidate',
  'Pragma': 'no-cache',
  'Expires': '0',
};

const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  { auth: { persistSession: false } }
);

serve(async (req) => {
  console.log('PDF Proxy request received:', req.url);
  
  if (req.method === 'OPTIONS') {
    console.log('Handling OPTIONS preflight request');
    return new Response(null, { headers: enhancedHeaders, status: 204 });
  }

  try {
    const url = new URL(req.url);
    let pdfPath = url.searchParams.get('pdf');
    
    if (!pdfPath) {
      console.error('Missing PDF path parameter');
      return new Response(
        JSON.stringify({ error: 'Missing PDF path parameter' }), 
        { headers: { ...enhancedHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    pdfPath = decodeURIComponent(pdfPath);
    console.log(`Processing PDF request for path: ${pdfPath}`);
    
    // First try to fetch using the storage API with admin privileges
    try {
      console.log(`Fetching PDF from storage: ${pdfPath}`);
      const { data, error } = await supabaseAdmin.storage
        .from('invoices')
        .download(pdfPath);
      
      if (error) {
        console.error('Error fetching PDF:', error);
        throw error;
      }
      
      if (!data) {
        throw new Error('No data returned from storage');
      }
      
      console.log(`PDF fetched successfully, size: ${data.size} bytes`);
      
      return new Response(data, {
        headers: {
          ...enhancedHeaders,
          'Content-Length': data.size.toString(),
        },
        status: 200,
      });
    } catch (error) {
      console.error('Error in pdf-proxy function:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in pdf-proxy function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        stack: error.stack
      }),
      {
        headers: { ...enhancedHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
