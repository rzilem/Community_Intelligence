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

// Enhanced URL normalization function
const normalizeUrl = (url: string): string => {
  try {
    console.log('PDF Proxy - Original URL:', url);
    
    // For URLs like https://domain.com//path//to//file
    if (url.startsWith('http')) {
      const parsedUrl = new URL(url);
      
      // Clean the pathname by:
      // 1. Split by slashes
      // 2. Filter out empty segments (which cause double slashes)
      // 3. Join with single slashes
      const pathSegments = parsedUrl.pathname.split('/')
        .filter(segment => segment !== '');
      
      // Reconstruct pathname with a single leading slash
      parsedUrl.pathname = '/' + pathSegments.join('/');
      
      const normalized = parsedUrl.toString();
      console.log('PDF Proxy - Normalized URL result:', normalized);
      return normalized;
    }
    
    // For relative paths, handle more carefully
    // First remove leading slashes
    let normalized = url.replace(/^\/+/, '');
    // Then replace multiple consecutive slashes with a single one
    normalized = normalized.replace(/\/+/g, '/');
    
    console.log('PDF Proxy - Normalized relative path result:', normalized);
    return normalized;
  } catch (e) {
    console.error('Error normalizing URL in pdf-proxy:', e);
    return url; // Return original if parsing fails
  }
};

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
    // Normalize the PDF path to handle double slashes
    pdfPath = normalizeUrl(pdfPath);
    console.log(`Processing PDF request for path (normalized): ${pdfPath}`);
    
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
          // Update pdfPath with the correct URL from the database and normalize it
          pdfPath = normalizeUrl(invoice.pdf_url);
          console.log(`Updated PDF path from invoice (normalized): ${pdfPath}`);
        }
      } catch (error) {
        console.error('Error querying invoice:', error);
      }
    }
    
    // Try using a signed URL approach first
    if (pdfPath.includes('supabase.co/storage/v1/object/public/')) {
      // Extract bucket name and path from URL
      try {
        const pathMatch = pdfPath.match(/\/public\/([^\/]+)\/(.+)/);
        if (pathMatch) {
          const bucketName = pathMatch[1];
          // Clean the object path by removing leading slashes
          const objectPath = pathMatch[2].replace(/^\/+/, '');
          
          console.log(`Generating signed URL for bucket: ${bucketName}, path: ${objectPath}`);
          
          // Generate a signed URL with the service role key
          const { data, error } = await supabaseAdmin.storage
            .from(bucketName)
            .createSignedUrl(objectPath, 3600); // Valid for 1 hour
            
          if (error) {
            console.error(`Error generating signed URL for ${bucketName}/${objectPath}:`, error);
          } else if (data?.signedUrl) {
            console.log(`Generated signed URL: ${data.signedUrl}`);
            
            // Fetch the file using the signed URL
            try {
              const response = await fetch(data.signedUrl);
              
              if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
              }
              
              const contentType = response.headers.get('content-type');
              const pdfBlob = await response.blob();
              
              console.log(`Fetched PDF via signed URL, size: ${pdfBlob.size}, type: ${contentType}`);
              
              return new Response(pdfBlob, {
                headers: {
                  ...enhancedHeaders,
                  'Content-Type': contentType || 'application/pdf',
                  'Content-Length': pdfBlob.size.toString(),
                },
                status: 200,
              });
            } catch (fetchError) {
              console.error('Error fetching with signed URL:', fetchError);
              // Continue to fallback methods
            }
          }
        }
      } catch (signedUrlError) {
        console.error('Error creating signed URL:', signedUrlError);
        // Continue to fallback methods
      }
    }
    
    // Fallback: Try to download from the invoices bucket directly
    console.log(`Falling back to direct download from 'invoices' bucket: ${pdfPath}`);
    try {
      // Extract just the filename from the path
      const fileName = pdfPath.split('/').pop() || pdfPath;
      console.log(`Trying to download file with name: ${fileName}`);
      
      // Try to download with just the filename
      const { data, error } = await supabaseAdmin.storage
        .from('invoices')
        .download(fileName);
        
      if (error) {
        console.error(`Storage error fetching from 'invoices' with filename ${fileName}:`, error.message);
        
        // If that failed, try with the exact path provided (but normalized)
        const cleanPath = pdfPath.replace(/^.*\/public\/invoices\//, '').replace(/^\/+/, '');
        console.log(`Trying with cleaned path: ${cleanPath}`);
        
        const secondAttempt = await supabaseAdmin.storage
          .from('invoices')
          .download(cleanPath);
          
        if (secondAttempt.error) {
          console.error(`Second attempt failed with path ${cleanPath}:`, secondAttempt.error);
          throw secondAttempt.error;
        }
        
        if (!secondAttempt.data) {
          throw new Error('No data returned from storage on second attempt');
        }
        
        console.log(`PDF fetched successfully on second attempt, size: ${secondAttempt.data.size} bytes`);
        
        return new Response(secondAttempt.data, {
          headers: {
            ...enhancedHeaders,
            'Content-Length': secondAttempt.data.size.toString(),
          },
          status: 200,
        });
      }
      
      if (!data) {
        throw new Error('No data returned from storage');
      }
      
      console.log(`PDF fetched successfully on first attempt, size: ${data.size} bytes`);
      
      return new Response(data, {
        headers: {
          ...enhancedHeaders,
          'Content-Length': data.size.toString(),
        },
        status: 200,
      });
    } catch (storageError) {
      console.error('All storage fetch attempts failed:', storageError);
      
      // Final fallback: Try to fetch the URL directly if it's a full URL
      if (pdfPath.startsWith('http')) {
        console.log(`Final attempt: Proxying external URL: ${pdfPath}`);
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
