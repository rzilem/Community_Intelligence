
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

// Enhanced CORS headers with additional security related headers
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

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: enhancedHeaders });
  }

  try {
    const url = new URL(req.url);
    let pdfPath = url.searchParams.get('pdf');
    
    console.log(`Raw PDF path from request: ${pdfPath}`);
    
    if (!pdfPath) {
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
    
    // Construct the storage URL with the full relative path
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 10);
    const fileUrl = `https://cahergndkwfqltxyikyr.supabase.co/storage/v1/object/public/invoices/${pdfPath}?t=${timestamp}&r=${randomId}`;
    
    console.log(`Fetching PDF from: ${fileUrl}`);

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
      console.error(`Failed to fetch PDF: ${response.status} ${response.statusText}`);
      console.error(`Response headers: ${JSON.stringify(Object.fromEntries(response.headers))}`);
      
      return new Response(
        JSON.stringify({ 
          error: `Failed to fetch PDF: ${response.statusText}`,
          status: response.status,
          url: fileUrl
        }),
        {
          headers: { ...enhancedHeaders, 'Content-Type': 'application/json' },
          status: response.status,
        }
      );
    }

    // Get the PDF file as a blob
    const pdfBlob = await response.blob();
    console.log(`PDF blob received, size: ${pdfBlob.size} bytes, type: ${pdfBlob.type}`);
    
    if (pdfBlob.size === 0) {
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
      'Content-Length': pdfBlob.size.toString(),
    };

    // Return the PDF with headers that allow inline viewing
    console.log(`Returning PDF response with headers:`, responseHeaders);
    return new Response(pdfBlob, {
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
