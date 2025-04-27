
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js';

// Enhanced CORS headers with additional security related headers
const enhancedHeaders = {
  ...corsHeaders,
  'Content-Type': 'application/pdf',
  'Content-Disposition': 'inline; filename="document.pdf"',
  'X-Content-Type-Options': 'nosniff',
  'Content-Security-Policy': "default-src * 'unsafe-inline' 'unsafe-eval' data: blob:; connect-src *; img-src * data: blob:; frame-ancestors *;",
  'X-Frame-Options': 'ALLOWALL', // Allow embedding in any frame
  'Cache-Control': 'no-cache, no-store, must-revalidate',
  'Pragma': 'no-cache',
  'Expires': '0',
};

// Initialize Supabase client with service role key for storage access - this bypasses RLS
const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  { auth: { persistSession: false } }
);

serve(async (req) => {
  console.log('PDF Proxy request received:', req.url);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('Handling OPTIONS preflight request');
    return new Response(null, { headers: enhancedHeaders, status: 204 });
  }

  try {
    const url = new URL(req.url);
    let pdfPath = url.searchParams.get('pdf');
    
    console.log(`Raw PDF path from request: ${pdfPath}`);
    
    if (!pdfPath) {
      console.error('Missing PDF path parameter');
      return new Response(
        JSON.stringify({ error: 'Missing PDF path parameter' }), 
        { headers: { ...enhancedHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Decode the URL-encoded path
    try {
      pdfPath = decodeURIComponent(pdfPath);
    } catch (e) {
      console.warn('Error decoding filename, using as-is:', e);
    }

    console.log(`Processing PDF request. Path: ${pdfPath}`);
    
    let pdfData;

    // First try to fetch using the storage API directly with admin privileges
    try {
      console.log(`Fetching PDF from Supabase storage using admin client: ${pdfPath}`);
      const { data, error } = await supabaseAdmin.storage
        .from('invoices')
        .download(pdfPath);
      
      if (error) {
        console.error('Error fetching PDF with admin client:', error);
        throw error;
      }
      
      if (!data) {
        throw new Error('No data returned from storage');
      }
      
      pdfData = data;
      console.log(`PDF fetched successfully using admin client, size: ${pdfData.size} bytes`);
    } catch (adminError) {
      // If admin access fails, fall back to public URL as before
      console.warn('Admin storage access failed, falling back to public URL:', adminError);
      
      // Construct the storage URL with the full relative path
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substring(2, 10);
      const fileUrl = `${Deno.env.get('SUPABASE_URL') || 'https://cahergndkwfqltxyikyr.supabase.co'}/storage/v1/object/public/invoices/${pdfPath}?t=${timestamp}&r=${randomId}`;
      
      console.log(`Fetching PDF from public URL: ${fileUrl}`);
      
      const response = await fetch(fileUrl, { 
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
        cache: 'no-store',
        method: 'GET'
      });
      
      if (!response.ok) {
        console.error(`Failed to fetch PDF from public URL: ${response.status} ${response.statusText}`);
        throw new Error(`Failed to fetch PDF: ${response.statusText} (${response.status})`);
      }
      
      pdfData = await response.blob();
      console.log(`PDF fetched successfully from public URL, size: ${pdfData.size} bytes`);
    }
    
    if (!pdfData || pdfData.size === 0) {
      console.error('Received empty PDF file');
      return new Response(
        JSON.stringify({ error: 'Received empty PDF file' }),
        {
          headers: { ...enhancedHeaders, 'Content-Type': 'application/json' },
          status: 500,
        }
      );
    }
    
    // Set specific headers for the PDF response
    const responseHeaders = {
      ...enhancedHeaders,
      'Content-Disposition': `inline; filename="${pdfPath.split('/').pop()}"`,
      'Content-Type': 'application/pdf',
      'Content-Length': pdfData.size.toString(),
    };

    // Return the PDF with headers that allow inline viewing
    console.log(`Returning PDF response with headers:`, responseHeaders);
    return new Response(pdfData, {
      headers: responseHeaders,
      status: 200,
    });
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
