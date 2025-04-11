
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
    
    // Normalize the email data to handle different formats
    const normalizedEmailData = normalizeEmailData(emailData);
    console.log("Normalized email data:", JSON.stringify(normalizedEmailData, null, 2));

    // Generate a tracking number for this communication
    const trackingNumber = await getNextTrackingNumber();
    
    // Register this communication in the log
    await registerCommunication(trackingNumber, 'email', normalizedEmailData);

    // Process the email to extract homeowner request information
    const requestData = await extractRequestData(normalizedEmailData, trackingNumber);

    // Insert homeowner request into the database
    const request = await createHomeownerRequest(requestData);

    console.log("Homeowner request created successfully:", request);

    return new Response(
      JSON.stringify({ success: true, message: "Homeowner request created", request }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200 
      }
    );
  } catch (error) {
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
