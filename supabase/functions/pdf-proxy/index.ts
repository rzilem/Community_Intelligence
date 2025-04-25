
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
  'Cache-Control': 'no-cache, no-store, must-revalidate', // No caching
  'Pragma': 'no-cache',
  'Expires': '0',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': '*',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: enhancedHeaders
    });
  }

  try {
    const url = new URL(req.url);
    const pdfPath = url.searchParams.get('pdf');
    
    // Debug information
    console.log(`Request received: ${req.url}`);
    console.log(`Headers: ${JSON.stringify(Object.fromEntries(req.headers))}`);

    // Validate PDF path
    if (!pdfPath) {
      console.error('Missing PDF path parameter');
      return new Response(JSON.stringify({ error: 'Missing PDF path parameter' }), {
        headers: { ...enhancedHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    console.log(`Raw PDF path from request: ${pdfPath}`);

    // Extract just the filename without any path or URL components
    let filename = pdfPath;
    
    // If it's a URL, extract the filename from the end of the path
    if (pdfPath.includes('://')) {
      try {
        const parsedUrl = new URL(pdfPath);
        filename = parsedUrl.pathname.split('/').pop() || '';
        console.log(`Extracted filename from URL: ${filename}`);
      } catch (e) {
        console.error('Error parsing URL:', e);
        // Fall back to using the original string if URL parsing fails
      }
    } else if (pdfPath.includes('/')) {
      // If it contains slashes but isn't a URL, take the last part
      filename = pdfPath.split('/').pop() || '';
      console.log(`Extracted filename from path: ${filename}`);
    }
    
    // Make sure we have a valid filename
    if (!filename || filename === '') {
      console.error('Failed to extract filename from path:', pdfPath);
      return new Response(
        JSON.stringify({ error: 'Failed to extract filename from path' }),
        {
          headers: { ...enhancedHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }
    
    // Remove URL encoding from filename if present
    try {
      const decodedFilename = decodeURIComponent(filename);
      if (decodedFilename !== filename) {
        console.log(`Decoded filename from ${filename} to ${decodedFilename}`);
        filename = decodedFilename;
      }
    } catch (e) {
      console.warn('Error decoding filename, using as-is:', e);
    }
    
    console.log(`Processing PDF request. Original path: ${pdfPath}, Extracted filename: ${filename}`);
    
    // Construct the storage URL with just the filename
    // Add timestamp to prevent caching - include unique identifier from request if available
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 10); // Add randomness
    const fileUrl = `https://cahergndkwfqltxyikyr.supabase.co/storage/v1/object/public/invoices/${filename}?t=${timestamp}&r=${randomId}`;
    console.log(`Fetching PDF from: ${fileUrl}`);

    // Fetch the PDF from Supabase Storage with strict no-cache headers
    const fetchHeaders = {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
    };

    const response = await fetch(fileUrl, { 
      headers: fetchHeaders,
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
    console.log(`PDF blob received, size: ${pdfBlob.size} bytes`);
    
    // Set specific headers for the PDF response
    const responseHeaders = {
      ...enhancedHeaders,
      'Content-Disposition': `inline; filename="${filename}"`,
      'Content-Length': pdfBlob.size.toString(),
      'Access-Control-Allow-Origin': '*',  // Ensure this is set for cross-origin requests
      'Access-Control-Expose-Headers': 'Content-Disposition, Content-Length, Content-Type',
      'X-Content-Type-Options': 'nosniff',
    };

    // Return the PDF with headers that allow inline viewing
    console.log(`Returning PDF response with headers:`, responseHeaders);
    return new Response(pdfBlob, {
      headers: responseHeaders,
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
