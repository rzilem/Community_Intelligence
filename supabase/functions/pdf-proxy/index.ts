
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

// Enhanced CORS headers with additional security related headers
const enhancedHeaders = {
  ...corsHeaders,
  'Content-Type': 'application/pdf',
  'Content-Disposition': 'inline',
  'X-Content-Type-Options': 'nosniff',
  'Content-Security-Policy': "default-src 'self'; frame-ancestors *;",
  'X-Frame-Options': 'ALLOWALL',
  'Cache-Control': 'public, max-age=3600',
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

    // Validate PDF path
    if (!pdfPath) {
      return new Response(JSON.stringify({ error: 'Missing PDF path parameter' }), {
        headers: { ...enhancedHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    // Extract just the filename without any path or URL components
    // This handles various formats like:
    // - full URLs (https://example.com/path/file.pdf)
    // - storage paths (/invoices/file.pdf)
    // - filenames (file.pdf)
    let filename = pdfPath;
    
    // If it's a URL, extract the filename from the end of the path
    if (pdfPath.includes('://')) {
      try {
        const parsedUrl = new URL(pdfPath);
        filename = parsedUrl.pathname.split('/').pop() || '';
      } catch (e) {
        console.error('Error parsing URL:', e);
        // Fall back to using the original string if URL parsing fails
      }
    } else if (pdfPath.includes('/')) {
      // If it contains slashes but isn't a URL, take the last part
      filename = pdfPath.split('/').pop() || '';
    }
    
    console.log(`Processing PDF request. Original path: ${pdfPath}, Extracted filename: ${filename}`);
    
    // Construct the storage URL with just the filename
    const fileUrl = `https://cahergndkwfqltxyikyr.supabase.co/storage/v1/object/public/invoices/${filename}`;
    console.log(`Fetching PDF from: ${fileUrl}`);

    // Fetch the PDF from Supabase Storage
    const response = await fetch(fileUrl);
    
    if (!response.ok) {
      console.error(`Failed to fetch PDF: ${response.status} ${response.statusText}`);
      return new Response(
        JSON.stringify({ error: `Failed to fetch PDF: ${response.statusText}` }),
        {
          headers: { ...enhancedHeaders, 'Content-Type': 'application/json' },
          status: response.status,
        }
      );
    }

    // Get the PDF file as a blob
    const pdfBlob = await response.blob();

    // Return the PDF with headers that allow inline viewing
    return new Response(pdfBlob, {
      headers: enhancedHeaders,
    });
  } catch (error) {
    console.error('Error in pdf-proxy function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...enhancedHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
