
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { processInvoiceEmail } from "./services/invoice-processor.ts";
import { createInvoice } from "./services/invoice-service.ts";
import { processMultipartFormData, normalizeEmailData } from "./utils/request-parser.ts";
import { corsHeaders } from "./utils/cors-headers.ts";
import { log } from "./utils/logging.ts";

serve(async (req) => {
  // Generate a unique request ID for tracing
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    await log({
      request_id: requestId,
      level: 'info',
      message: 'CORS preflight request',
      metadata: { method: req.method }
    });
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  try {
    await log({
      request_id: requestId,
      level: 'info',
      message: 'Invoice email processing started',
      metadata: {
        contentType: req.headers.get("content-type"),
        method: req.method
      }
    });
    
    // Make a copy of the request to inspect the raw body if needed
    const reqCopy = req.clone();
    try {
      // Try to get the raw body as text for debugging 
      const rawText = await reqCopy.text();
      await log({
        request_id: requestId,
        level: 'debug',
        message: 'Raw request body received',
        metadata: {
          length: rawText.length,
          snippet: rawText.length < 1000 ? rawText : rawText.substring(0, 1000) + "..."
        }
      });
    } catch (e) {
      await log({
        request_id: requestId,
        level: 'warn',
        message: 'Could not read raw request body',
        metadata: { error: e.message }
      });
    }
    
    // Get email data from request - handle both JSON and multipart form data
    let emailData;
    
    try {
      emailData = await processMultipartFormData(req);
      await log({
        request_id: requestId,
        level: 'info',
        message: 'Successfully processed form data',
        metadata: {
          keys: Object.keys(emailData)
        }
      });
    } catch (parseError) {
      await log({
        request_id: requestId,
        level: 'error',
        message: 'Error parsing request body as form data',
        metadata: { error: parseError.message }
      });
      
      try {
        // Clone the request before trying to parse as JSON
        const jsonReqCopy = req.clone();
        // Fallback to regular JSON parsing
        emailData = await jsonReqCopy.json();
        await log({
          request_id: requestId,
          level: 'info',
          message: 'Successfully parsed as JSON fallback',
          metadata: {
            keys: Object.keys(emailData)
          }
        });
      } catch (jsonError) {
        await log({
          request_id: requestId,
          level: 'error',
          message: 'Error parsing request as JSON',
          metadata: {
            formError: parseError.message,
            jsonError: jsonError.message,
            headers: Object.fromEntries([...req.headers.entries()])
          }
        });
        
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: "Invalid request format", 
            details: `${parseError.message}, then ${jsonError.message}`,
            headers: Object.fromEntries([...req.headers.entries()])
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
      await log({
        request_id: requestId,
        level: 'error',
        message: 'Empty email data received',
        metadata: {
          headers: Object.fromEntries([...req.headers.entries()])
        }
      });
      
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Empty email data", 
          details: "The email webhook payload was empty or invalid",
          headers: Object.fromEntries([...req.headers.entries()])
        }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400 
        }
      );
    }
    
    // Normalize the email data to handle different formats
    const normalizedEmailData = normalizeEmailData(emailData);
    await log({
      request_id: requestId,
      level: 'info',
      message: 'Normalized invoice email data',
      metadata: {
        from: normalizedEmailData.from,
        to: normalizedEmailData.to,
        subject: normalizedEmailData.subject,
        hasHtml: !!normalizedEmailData.html,
        hasText: !!normalizedEmailData.text,
        attachmentsCount: normalizedEmailData.attachments?.length
      }
    });

    // Check if we have either HTML content, text content, or subject (minimum required to process)
    if (!normalizedEmailData.html && !normalizedEmailData.text && !normalizedEmailData.subject) {
      await log({
        request_id: requestId,
        level: 'error',
        message: 'Email missing required content',
        metadata: {
          hasHtml: !!normalizedEmailData.html,
          hasText: !!normalizedEmailData.text,
          hasSubject: !!normalizedEmailData.subject
        }
      });
      
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
    await log({
      request_id: requestId,
      level: 'info',
      message: 'Processing invoice email to extract data'
    });
    
    const invoiceData = await processInvoiceEmail(normalizedEmailData, requestId);
    await log({
      request_id: requestId,
      level: 'info',
      message: 'Extracted invoice data',
      metadata: {
        vendor: invoiceData.vendor,
        amount: invoiceData.amount,
        invoiceNumber: invoiceData.invoice_number,
        hasPdfUrl: !!invoiceData.pdf_url
      }
    });

    // Always attempt to create the invoice, even with partial data
    try {
      const invoice = await createInvoice(invoiceData);

      await log({
        request_id: requestId,
        level: 'info',
        message: 'Invoice created successfully',
        metadata: {
          id: invoice.id,
          vendor: invoice.vendor,
          amount: invoice.amount,
          pdf_url: invoice.pdf_url || 'none',
          hasHtmlContent: !!invoice.html_content
        }
      });

      // If we have partial data but created the invoice anyway
      if (!invoiceData.vendor || invoiceData.vendor === "Unknown Vendor" || !invoiceData.amount || invoiceData.amount === 0) {
        return new Response(
          JSON.stringify({ 
            success: true, 
            warning: "Invoice created with partial data", 
            message: "Invoice was created but may need manual review",
            invoice: invoice 
          }),
          { 
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 201 
          }
        );
      }

      // All data looks good
      return new Response(
        JSON.stringify({ success: true, message: "Invoice created", invoice }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 201 
        }
      );
    } catch (dbError: any) {
      await log({
        request_id: requestId,
        level: 'error',
        message: 'Database error creating invoice',
        metadata: {
          error: dbError.message,
          extracted_data: invoiceData
        }
      });
      
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Database error", 
          details: dbError.message,
          extracted_data: invoiceData
        }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500 
        }
      );
    }
  } catch (error: any) {
    await log({
      request_id: requestId,
      level: 'error',
      message: 'Error handling invoice email',
      metadata: {
        error: error.message,
        stack: error.stack
      }
    });
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: "Processing error", 
        details: error.message
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500 
      }
    );
  }
});
