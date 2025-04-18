
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { processInvoiceEmail } from "./services/invoice-processor.ts";
import { createInvoice } from "./services/invoice-service.ts";
import { processMultipartFormData, normalizeEmailData } from "./utils/request-parser.ts";
import { corsHeaders } from "./utils/cors-headers.ts";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  try {
    console.log("Received invoice email with content-type:", req.headers.get("content-type"));
    console.log("Headers:", JSON.stringify(Object.fromEntries([...req.headers.entries()]), null, 2));
    
    // Get email data from request - handle both JSON and multipart form data
    let emailData;
    
    try {
      emailData = await processMultipartFormData(req);
    } catch (parseError) {
      console.error("Error parsing request body:", parseError);
      try {
        // Fallback to regular JSON parsing
        emailData = await req.json();
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
    
    // Normalize the email data to handle different formats
    const normalizedEmailData = normalizeEmailData(emailData);
    console.log("Normalized invoice email data:", JSON.stringify(normalizedEmailData, null, 2));

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
    const invoiceData = await processInvoiceEmail(normalizedEmailData);

    // Always attempt to create the invoice, even with partial data
    try {
      const invoice = await createInvoice(invoiceData);

      console.log("Invoice created successfully:", invoice);

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
      console.error("Database error creating invoice:", dbError);
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
    console.error("Error handling invoice email:", error);
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
