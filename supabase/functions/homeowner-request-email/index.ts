
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { processEmailData } from "./services/email-processor.ts";
import { createRequest } from "./services/request-service.ts";
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
    console.log("Received homeowner request email webhook");

    // Get email data from request
    const emailData = await req.json();

    // Validate we have at least some data to work with
    if (!emailData || Object.keys(emailData).length === 0) {
      console.error("Empty email data received");
      return new Response(
        JSON.stringify({ success: false, error: "Empty email data" }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400 
        }
      );
    }

    console.log("Processing email data to extract request information");
    
    // Process the email to extract request information
    const requestData = await processEmailData(emailData);

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
