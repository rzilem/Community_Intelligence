
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders
    });
  }

  try {
    const url = new URL(req.url);
    const pdfPath = url.searchParams.get('pdf');

    // Validate PDF path
    if (!pdfPath) {
      return new Response(JSON.stringify({ error: 'Missing PDF path parameter' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    // Construct the file URL to Supabase Storage
    // We'll clean up the path to handle both full URLs and relative paths
    const filePath = pdfPath.includes('://') 
      ? new URL(pdfPath).pathname.split('/').pop() // Extract filename from full URL
      : pdfPath; // Use as is if it's already just a filename
    
    const fileUrl = `https://cahergndkwfqltxyikyr.supabase.co/storage/v1/object/public/invoices/${filePath}`;
    console.log(`Proxying PDF from: ${fileUrl}`);

    // Fetch the PDF from Supabase Storage
    const response = await fetch(fileUrl);
    
    if (!response.ok) {
      console.error(`Failed to fetch PDF: ${response.status} ${response.statusText}`);
      return new Response(
        JSON.stringify({ error: `Failed to fetch PDF: ${response.statusText}` }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: response.status,
        }
      );
    }

    // Get the PDF file as a blob
    const pdfBlob = await response.blob();

    // Return the PDF with headers that allow inline viewing
    return new Response(pdfBlob, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'inline',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    console.error('Error in pdf-proxy function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
