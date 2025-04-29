// Follow this setup guide to integrate the Deno runtime with Supabase:
// https://supabase.com/docs/guides/functions/deno-runtime

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const pdfUrl = url.searchParams.get('pdf');
    const bucketName = url.searchParams.get('bucket') || 'invoices';
    const path = url.searchParams.get('path');

    if (!pdfUrl) {
      return new Response('Missing PDF URL parameter', { 
        status: 400, 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'text/plain' 
        } 
      });
    }

    console.log(`PDF Proxy accessed for: ${pdfUrl}`);

    // Initialize Supabase client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '',
      { auth: { persistSession: false } }
    );

    let pdfContent: Uint8Array | null = null;
    let contentType = 'application/pdf';

    // Case 1: Direct Supabase storage URL
    if (pdfUrl.includes('supabase.co/storage/v1/object')) {
      // If we have the path, get directly from storage
      if (path) {
        console.log(`Fetching from storage path: ${bucketName}/${path}`);
        const { data, error } = await supabaseAdmin.storage
          .from(bucketName)
          .download(path);

        if (error) {
          console.error("Storage download error:", error);
          throw new Error(`Failed to download from storage: ${error.message}`);
        }

        if (!data) {
          throw new Error('No data returned from storage');
        }

        const arrayBuffer = await data.arrayBuffer();
        pdfContent = new Uint8Array(arrayBuffer);
      } else {
        // Otherwise fetch the URL directly
        const response = await fetch(pdfUrl);
        if (!response.ok) {
          throw new Error(`Failed to fetch PDF: ${response.status} ${response.statusText}`);
        }

        const arrayBuffer = await response.arrayBuffer();
        pdfContent = new Uint8Array(arrayBuffer);
        contentType = response.headers.get('Content-Type') || 'application/pdf';
      }
    } 
    // Case 2: Relative path in storage
    else if (!pdfUrl.startsWith('http')) {
      console.log(`Fetching relative path from storage: ${bucketName}/${pdfUrl}`);
      const { data, error } = await supabaseAdmin.storage
        .from(bucketName)
        .download(pdfUrl);

      if (error) {
        console.error("Storage download error:", error);
        throw new Error(`Failed to download from storage: ${error.message}`);
      }

      if (!data) {
        throw new Error('No data returned from storage');
      }

      const arrayBuffer = await data.arrayBuffer();
      pdfContent = new Uint8Array(arrayBuffer);
    } 
    // Case 3: External URL
    else {
      console.log(`Fetching external URL: ${pdfUrl}`);
      const response = await fetch(pdfUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch PDF: ${response.status} ${response.statusText}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      pdfContent = new Uint8Array(arrayBuffer);
      contentType = response.headers.get('Content-Type') || 'application/pdf';
    }

    if (!pdfContent) {
      throw new Error('Failed to retrieve PDF content');
    }

    // Verify this is a PDF file (should start with %PDF-)
    const pdfHeader = new TextDecoder().decode(pdfContent.slice(0, 5));
    if (!pdfHeader.startsWith('%PDF')) {
      console.warn(`File does not appear to be a valid PDF. Header: ${pdfHeader}`);
    }

    console.log(`Successfully retrieved PDF, size: ${pdfContent.length} bytes`);

    return new Response(pdfContent, {
      headers: {
        ...corsHeaders,
        'Content-Type': contentType,
        'Content-Disposition': 'inline',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });

  } catch (error) {
    console.error("PDF proxy error:", error.message);
    
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 
        ...corsHeaders,
        'Content-Type': 'application/json' 
      }
    });
  }
});
