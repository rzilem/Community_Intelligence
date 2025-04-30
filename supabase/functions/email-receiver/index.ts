
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { processMultipartFormData, normalizeEmailData } from "./utils/request-parser.ts";
import { processEmail } from "./services/email-processor.ts";
import { createLead } from "./services/lead-service.ts";
import { corsHeaders } from "./utils/cors-headers.ts";

// Add a configuration flag to prevent modifications
const CURRENT_CONFIG_LOCKED = true;

serve(async (req) => {
  // Check if configuration is locked
  if (CURRENT_CONFIG_LOCKED) {
    console.log("Configuration is currently locked. No modifications allowed.");
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
    console.log("Normalized email data:", JSON.stringify(normalizedEmailData, null, 2));

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

    // Process the email to extract lead information
    const leadData = await processEmail(normalizedEmailData);

    // Validate extracted lead data has required fields
    if (!leadData || !leadData.email) {
      console.error("Failed to extract required lead fields", leadData);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Extraction failed", 
          details: "Could not extract required lead fields (email)",
          partial_data: leadData || {}
        }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 422 
        }
      );
    }

    // Insert lead into the database
    try {
      const lead = await createLead(leadData);

      console.log("Lead created successfully:", lead);

      return new Response(
        JSON.stringify({ success: true, message: "Lead created", lead }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200 
        }
      );
    } catch (dbError: any) {
      console.error("Database error creating lead:", dbError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Database error", 
          details: dbError.message,
          extracted_data: leadData || {}
        }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500 
        }
      );
    }
  } catch (error: any) {
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
