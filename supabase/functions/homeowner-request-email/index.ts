
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
    let emailData;
    try {
      emailData = await req.json();
    } catch (parseError) {
      console.error("Error parsing request body:", parseError);
      // Try to get the raw text and see if we can parse it another way
      const rawText = await req.text();
      console.log("Raw request body:", rawText.substring(0, 200));
      
      try {
        // Try parsing as JSON again (in case text() worked better than json())
        emailData = JSON.parse(rawText);
      } catch (secondError) {
        console.error("Failed to parse request body as JSON:", secondError);
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: "Invalid request format",
            message: "Could not parse request body as JSON"
          }),
          { 
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 400 
          }
        );
      }
    }

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
    console.log("Email data keys:", Object.keys(emailData));
    
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
