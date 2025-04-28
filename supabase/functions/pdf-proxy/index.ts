
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js';

const enhancedHeaders = {
  ...corsHeaders,
  'Content-Type': 'application/pdf',
  'Content-Disposition': 'inline; filename="document.pdf"',
  'X-Content-Type-Options': 'nosniff',
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
    const fileId = url.searchParams.get('id');
    
    if (!pdfPath) {
      console.error('Missing PDF path parameter');
      return new Response(
        JSON.stringify({ error: 'Missing PDF path parameter' }), 
        { headers: { ...enhancedHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    pdfPath = decodeURIComponent(pdfPath);
    console.log(`Processing PDF request for path: ${pdfPath}`);
    
    // If we have an invoice ID, try to get the PDF URL from the invoices table
    if (fileId) {
      console.log(`Looking up invoice with ID: ${fileId}`);
      try {
        const { data: invoice, error: invoiceError } = await supabaseAdmin
          .from('invoices')
          .select('pdf_url')
          .eq('id', fileId)
          .single();
          
        if (invoiceError) {
          console.error('Error fetching invoice:', invoiceError);
        } else if (invoice && invoice.pdf_url) {
          console.log(`Found PDF URL in invoice: ${invoice.pdf_url}`);
          // Update pdfPath with the correct URL from the database
          pdfPath = invoice.pdf_url;
          console.log(`Updated PDF path from invoice: ${pdfPath}`);
        }
      } catch (error) {
        console.error('Error querying invoice:', error);
      }
    }
    
    // Handle full Supabase storage URLs
    if (pdfPath.includes('supabase.co/storage/v1/object/public/')) {
      // Extract bucket name and path from URL
      try {
        const pathMatch = pdfPath.match(/\/public\/([^\/]+)\/(.+)/);
        if (pathMatch) {
          const bucketName = pathMatch[1];
          const objectPath = pathMatch[2];
          
          console.log(`Extracted from URL - bucket: ${bucketName}, path: ${objectPath}`);
          
          // Fetch directly from storage using extracted path
          const { data, error } = await supabaseAdmin.storage
            .from(bucketName)
            .download(objectPath);
            
          if (error) {
            throw error;
          }
          
          if (!data) {
            throw new Error('No data returned from storage');
          }
          
          console.log(`PDF fetched successfully from URL path, size: ${data.size} bytes`);
          
          return new Response(data, {
            headers: {
              ...enhancedHeaders,
              'Content-Length': data.size.toString(),
            },
            status: 200,
          });
        }
      } catch (urlParseError) {
        console.error('Error parsing Supabase URL:', urlParseError);
        // Continue with normal processing if URL parsing failed
      }
    }
    
    // Try to download from the invoices bucket
    console.log(`Fetching PDF from storage bucket 'invoices': ${pdfPath}`);
    try {
      // First, try with the exact path as provided
      let { data, error } = await supabaseAdmin.storage
        .from('invoices')
        .download(pdfPath);
        
      // If that failed and the path includes directories, try just the filename
      if (error && pdfPath.includes('/')) {
        const filename = pdfPath.split('/').pop();
        console.log(`First attempt failed, trying with just filename: ${filename}`);
        ({ data, error } = await supabaseAdmin.storage
          .from('invoices')
          .download(filename || pdfPath));
      }
      
      if (error) {
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
    } catch (storageError) {
      console.error('Storage fetch error:', storageError);
      
      // If we couldn't fetch from storage, check if the path is a full URL
      if (pdfPath.startsWith('http')) {
        console.log(`Attempting to proxy external URL: ${pdfPath}`);
        try {
          const response = await fetch(pdfPath, {
            headers: {
              'Accept': 'application/pdf',
            }
          });
          
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          
          const contentType = response.headers.get('content-type');
          const data = await response.blob();
          
          console.log(`Fetched external PDF, size: ${data.size}, type: ${contentType}`);
          
          return new Response(data, {
            headers: {
              ...enhancedHeaders,
              'Content-Type': contentType || 'application/pdf',
              'Content-Length': data.size.toString(),
            },
            status: 200,
          });
        } catch (fetchError) {
          console.error('External URL fetch error:', fetchError);
          throw fetchError;
        }
      } else {
        throw storageError;
      }
    }
  } catch (error) {
    console.error('Error in pdf-proxy function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        stack: error.stack,
        note: "Please check if the file exists in the 'invoices' storage bucket"
      }),
      {
        headers: { ...enhancedHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
