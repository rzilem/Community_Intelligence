
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { processMultipartFormData, normalizeEmailData } from "../email-receiver/utils/request-parser.ts";
import { processInvoiceEmail } from "./services/invoice-processor.ts";
import { createInvoice } from "./services/invoice-service.ts";
import { corsHeaders } from "../email-receiver/utils/cors-headers.ts";

// Handle the incoming webhook request
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }

  try {
    console.log("Received invoice email with content-type:", req.headers.get("content-type"));
    
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
          JSON.stringify({ success: false, error: "Invalid request format" }),
          { 
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 400 
          }
        );
      }
    }
    
    // Normalize the email data to handle different formats
    const normalizedEmailData = normalizeEmailData(emailData);
    console.log("Normalized invoice email data:", JSON.stringify(normalizedEmailData, null, 2));

    // Process the email to extract invoice information
    const invoiceData = await processInvoiceEmail(normalizedEmailData);

    // Insert invoice into the database
    const invoice = await createInvoice(invoiceData);

    console.log("Invoice created successfully:", invoice);

    return new Response(
      JSON.stringify({ success: true, message: "Invoice created", invoice }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200 
      }
    );
  } catch (error) {
    console.error("Error handling invoice email:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500 
      }
    );
  }
});
