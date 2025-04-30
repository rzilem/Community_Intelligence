
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { processMultipartFormData, normalizeEmailData } from "./utils/request-parser.ts";
import { processInvoiceEmail } from "./services/invoice-processor.ts";
import { createInvoice } from "./services/invoice-service.ts";
import { corsHeaders } from "./utils/cors-headers.ts";
import { normalizeUrl } from "./utils/url-normalizer.ts";

// Create a Supabase client with the service role key to bypass RLS and ensure proper authorization
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') || '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
);

// Log environment variables for debugging (not the full secret key)
console.log("SUPABASE_URL is set:", !!Deno.env.get('SUPABASE_URL'));
console.log("SUPABASE_SERVICE_ROLE_KEY is set:", !!Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'));

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  // Validate request origin
  const origin = req.headers.get("origin");
  if (origin) {
    // Only allow requests from trusted origins
    // This should be configured based on your deployment environment
    const allowedOrigins = [
      "https://hoa-ai-community-nexus.lovable.app", 
      "https://cahergndkwfqltxyikyr.supabase.co"
    ];
    
    if (!allowedOrigins.includes(origin)) {
      console.warn(`Blocked request from untrusted origin: ${origin}`);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Unauthorized origin" 
        }),
        { 
          headers: { "Content-Type": "application/json" },
          status: 403 
        }
      );
    }
  }

  try {
    console.log("Received invoice email with content-type:", req.headers.get("content-type"));
    
    // Make a copy of the request to inspect the raw body if needed
    const reqCopy = req.clone();
    try {
      // Try to get the raw body as text for debugging 
      const rawText = await reqCopy.text();
      console.log(`Raw request body length: ${rawText.length} characters`);
      if (rawText.length < 10000) { // Only log if not too large
        // Redact potential sensitive information before logging
        const redactedText = rawText.replace(/("password"|"token"|"key"|"secret"):\s*"[^"]*"/g, '$1: "[REDACTED]"');
        console.log("Raw request body (redacted):", redactedText);
      } else {
        console.log("Raw request body too large to log");
      }
    } catch (e) {
      console.log("Could not read raw request body:", e);
    }
    
    // Get email data from request - handle both JSON and multipart form data
    let emailData;
    
    try {
      emailData = await processMultipartFormData(req);
      console.log("Successfully processed form data");
    } catch (parseError) {
      console.error("Error parsing request body:", parseError);
      try {
        // Clone the request before trying to parse as JSON
        const jsonReqCopy = req.clone();
        // Fallback to regular JSON parsing
        const rawJson = await jsonReqCopy.json();
        
        // Validate the JSON structure
        if (typeof rawJson !== 'object') {
          throw new Error("Invalid JSON structure");
        }
        
        // Assign the validated data
        emailData = rawJson;
        console.log("Successfully parsed as JSON fallback");
      } catch (jsonError) {
        console.error("Error parsing request as JSON:", jsonError);
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: "Invalid request format", 
            details: `${parseError.message}, then ${jsonError.message}`
          }),
          { 
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 400 
          }
        );
      }
    }
    
    // Validate we have at least some data to work with
    if (!emailData || (typeof emailData === 'object' && Object.keys(emailData).length === 0)) {
      console.error("Empty email data received");
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Empty email data", 
          details: "The email webhook payload was empty or invalid"
        }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400 
        }
      );
    }
    
    // Apply rate limiting for invoice processing
    // This would typically be implemented at the network level or using Redis/etc
    // For simplicity, we're just logging the concept here
    console.log("Rate limiting would be applied here");
    
    // Normalize the email data to handle different formats
    const normalizedEmailData = normalizeEmailData(emailData);
    console.log("Normalized invoice email data:", JSON.stringify({
      from: normalizedEmailData.from,
      to: normalizedEmailData.to,
      subject: normalizedEmailData.subject,
      hasHtml: !!normalizedEmailData.html,
      hasText: !!normalizedEmailData.text,
      attachmentsCount: normalizedEmailData.attachments?.length
    }, null, 2));

    // Check if we have either HTML content, text content, or subject (minimum required to process)
    if (!normalizedEmailData.html && !normalizedEmailData.text && !normalizedEmailData.subject) {
      console.error("Email missing required content");
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Missing required content", 
          details: "Email must contain HTML, text content, or at least a subject"
        }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 422 
        }
      );
    }

    // Process the email to extract invoice information
    console.log("Processing invoice email to extract data");
    const invoiceData = await processInvoiceEmail(normalizedEmailData);
    
    // Log invoice data without sensitive content
    const redactedInvoiceData = { ...invoiceData };
    if (redactedInvoiceData.html_content) {
      redactedInvoiceData.html_content = "[HTML_CONTENT_REDACTED]";
    }
    if (redactedInvoiceData.email_content) {
      redactedInvoiceData.email_content = "[EMAIL_CONTENT_REDACTED]";
    }
    console.log("Extracted invoice data:", JSON.stringify(redactedInvoiceData, null, 2));

    // Remove association_type if it exists to avoid database errors
    if (invoiceData.association_type !== undefined) {
      console.log("Removing association_type from invoice data to avoid schema errors");
      delete invoiceData.association_type;
    }

    // Input validation for invoice data before database insertion
    if (invoiceData.amount && (typeof invoiceData.amount !== 'number' || isNaN(invoiceData.amount))) {
      console.error("Invalid invoice amount:", invoiceData.amount);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Invalid invoice data", 
          details: "Invoice amount must be a valid number"
        }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 422 
        }
      );
    }

    // Process attachments if present
    if (normalizedEmailData.attachments && normalizedEmailData.attachments.length > 0) {
      console.log("Processing attachments:", normalizedEmailData.attachments.length);
      
      // Find PDF attachments
      const pdfAttachments = normalizedEmailData.attachments.filter(att => 
        att.contentType.includes('pdf') || 
        att.filename.toLowerCase().endsWith('.pdf')
      );
      
      if (pdfAttachments.length > 0) {
        console.log(`Found ${pdfAttachments.length} PDF attachment(s)`);
        const attachment = pdfAttachments[0]; // Use the first PDF
        
        try {
          // Generate a unique filename
          const fileExt = '.pdf';
          const fileName = `invoice_${Date.now()}${fileExt}`;
          
          // Convert base64 content to binary
          const binaryContent = Uint8Array.from(atob(attachment.content), c => c.charCodeAt(0));
          
          // Upload to storage
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('invoices')
            .upload(fileName, binaryContent, {
              contentType: 'application/pdf',
              upsert: true
            });
            
          if (uploadError) {
            console.error("PDF upload error:", uploadError);
          } else {
            console.log("PDF uploaded successfully:", fileName);
            
            // Get public URL
            const { data: urlData } = supabase.storage
              .from('invoices')
              .getPublicUrl(fileName);
              
            if (urlData?.publicUrl) {
              invoiceData.pdf_url = urlData.publicUrl;
              invoiceData.source_document = fileName;
              console.log("PDF public URL generated:", urlData.publicUrl);
            }
          }
        } catch (pdfError) {
          console.error("Error processing PDF:", pdfError);
        }
      }
    }

    // Always attempt to create the invoice, even with partial data
    try {
      const invoice = await createInvoice(invoiceData);

      console.log("Invoice created successfully:", JSON.stringify({
        id: invoice.id,
        vendor: invoice.vendor,
        amount: invoice.amount,
        pdf_url: invoice.pdf_url ? 'present' : 'none',
        html_content: invoice.html_content ? 'present' : 'none'
      }, null, 2));

      // If we have partial data but created the invoice anyway
      if (!invoiceData.vendor || invoiceData.vendor === "Unknown Vendor" || !invoiceData.amount || invoiceData.amount === 0) {
        return new Response(
          JSON.stringify({ 
            success: true, 
            warning: "Invoice created with partial data", 
            message: "Invoice was created but may need manual review",
            invoice: {
              id: invoice.id,
              vendor: invoice.vendor,
              amount: invoice.amount,
              status: invoice.status
            } 
          }),
          { 
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 201 
          }
        );
      }

      // All data looks good
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Invoice created", 
          invoice: {
            id: invoice.id,
            vendor: invoice.vendor,
            amount: invoice.amount,
            status: invoice.status
          }
        }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 201 
        }
      );
    } catch (dbError) {
      console.error("Database error creating invoice:", dbError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Database error", 
          details: dbError.message
        }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500 
        }
      );
    }
  } catch (error) {
    console.error("Error handling invoice email:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: "Processing error", 
        details: "An internal server error occurred"  // Don't expose raw error details to client
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500 
      }
    );
  }
});
