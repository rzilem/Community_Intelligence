
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { processMultipartFormData } from "./utils/request-parser.ts";
import { processEmail } from "./services/email-processor.ts";
import { createLead } from "./services/lead-service.ts";
import { corsHeaders } from "./utils/cors-headers.ts";

// Handle the incoming webhook request
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }

  try {
    console.log("Received request with content-type:", req.headers.get("content-type"));
    
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
    
    console.log("Received email webhook:", JSON.stringify(emailData, null, 2));

    // Process the email to extract lead information
    const leadData = await processEmail(emailData);

    // Insert lead into the database
    const lead = await createLead(leadData);

    console.log("Lead created successfully:", lead);

    return new Response(
      JSON.stringify({ success: true, message: "Lead created", lead }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200 
      }
    );
  } catch (error) {
    console.error("Error handling email:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500 
      }
    );
  }
});
