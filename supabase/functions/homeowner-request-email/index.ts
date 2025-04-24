
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { processEmailData } from "./services/email-processor.ts";
import { createRequest } from "./services/request-service.ts";
import { corsHeaders } from "./utils/cors-headers.ts";
import { processMultipartFormData, normalizeEmailData } from "./utils/request-parser.ts";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  try {
    // Log all incoming request headers for debugging
    console.log("Received homeowner request email webhook");
    console.log("Request headers:", JSON.stringify(Object.fromEntries([...req.headers.entries()]), null, 2));
    
    // IMPORTANT: CloudMailin doesn't send standard auth headers, so we skip the check
    // NO AUTHENTICATION CHECK HERE - THIS IS INTENTIONAL FOR CLOUDMAILIN WEBHOOKS
    
    // Get email data from request - handle both JSON and multipart form data
    let emailData;
    
    try {
      // Try to process the request using our multipart form data processor first
      emailData = await processMultipartFormData(req);
      console.log("Successfully processed multipart form data");
    } catch (parseError) {
      console.error("Error parsing request as multipart form data:", parseError);
      
      // Clone the request before attempting to parse as JSON
      // This avoids the "body already consumed" error
      const clonedRequest = req.clone();
      
      try {
        // Fallback to regular JSON parsing
        emailData = await clonedRequest.json();
        console.log("Successfully parsed request as JSON");
      } catch (jsonError) {
        console.error("Error parsing request as JSON:", jsonError);
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: "Invalid request format",
            message: "Could not parse request body as multipart form data or JSON",
            parseError: parseError.message,
            jsonError: jsonError.message,
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
      console.error("Empty email data received");
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
    console.log("Processing normalized email data:", JSON.stringify(normalizedEmailData, null, 2));

    // Process the email to extract request information
    console.log("Extracting request information from email");
    const requestData = await processEmailData(normalizedEmailData);

    // Create the homeowner request in the database
    console.log("Creating homeowner request with the extracted data");
    const request = await createRequest(requestData);

    console.log("Homeowner request created successfully:", request.id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Homeowner request created", 
        request 
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 201 
      }
    );
  } catch (error) {
    console.error("Error handling homeowner request email:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || "Unknown error" 
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500 
      }
    );
  }
});
