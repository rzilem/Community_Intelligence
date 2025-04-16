
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { corsHeaders } from "./utils/cors-headers.ts";
import { processMultipartFormData, normalizeEmailData } from "./utils/request-parser.ts";
import { extractRequestData } from "./services/email-processor.ts";
import { createHomeownerRequest } from "./services/request-service.ts";
import { getNextTrackingNumber, registerCommunication } from "./services/tracking-service.ts";

// Handle the incoming webhook request
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }

  try {
    console.log("Received homeowner request email with content-type:", req.headers.get("content-type"));
    
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

    // Generate a tracking number for this communication
    const trackingNumber = await getNextTrackingNumber();
    
    // Register this communication in the log
    await registerCommunication(trackingNumber, 'email', normalizedEmailData);

    // Process the email to extract homeowner request information
    const requestData = await extractRequestData(normalizedEmailData, trackingNumber);

    // Insert homeowner request into the database
    try {
      const request = await createHomeownerRequest(requestData);

      console.log("Homeowner request created successfully:", request);

      return new Response(
        JSON.stringify({ success: true, message: "Homeowner request created", request }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200 
        }
      );
    } catch (dbError: any) {
      console.error("Database error creating homeowner request:", dbError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Database error", 
          details: dbError.message,
          extracted_data: requestData || {}
        }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500 
        }
      );
    }
  } catch (error: any) {
    console.error("Error handling homeowner request email:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500 
      }
    );
  }
});
