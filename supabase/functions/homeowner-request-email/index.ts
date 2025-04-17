import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { processEmailData } from "./services/email-processor.ts";
import { createRequest } from "./services/request-service.ts";
import { processMultipartFormData, normalizeEmailData } from "./utils/request-parser.ts";
import { corsHeaders } from "./utils/cors-headers.ts";

// Add a configuration flag to prevent modifications
const CURRENT_CONFIG_LOCKED = true;

console.log("Homeowner request email function starting up...");

// Handle the incoming webhook request
serve(async (req) => {
  console.log("Received request to homeowner-request-email function");
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    console.log("Handling OPTIONS request");
    return new Response(null, { headers: corsHeaders, status: 204 });
  }

  try {
    const contentType = req.headers.get("content-type") || "";
    console.log("Received homeowner request email with content-type:", contentType);
    console.log("Request headers:", JSON.stringify(Object.fromEntries([...req.headers.entries()]), null, 2));
    
    // Try to read the raw body for debugging
    let rawBody = "";
    try {
      rawBody = await req.clone().text();
      console.log("Raw request body preview (first 500 chars):", rawBody.substring(0, 500));
    } catch (rawError) {
      console.error("Could not read raw body:", rawError);
    }
    
    // Get email data from request - handle both JSON and multipart form data
    let emailData;
    
    try {
      emailData = await processMultipartFormData(req.clone());
      console.log("Successfully processed as multipart form data");
    } catch (parseError) {
      console.error("Error parsing request as multipart form data:", parseError);
      try {
        // Fallback to regular JSON parsing
        emailData = await req.json();
        console.log("Successfully processed as JSON");
      } catch (jsonError) {
        console.error("Error parsing request as JSON:", jsonError);
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: "Invalid request format", 
            details: `Failed to parse as multipart form data: ${parseError.message}, then failed as JSON: ${jsonError.message}`,
            content_type: contentType,
            raw_body_preview: rawBody.substring(0, 200) + (rawBody.length > 200 ? "..." : "")
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
          content_type: contentType,
          raw_body_preview: rawBody.substring(0, 200) + (rawBody.length > 200 ? "..." : "")
        }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400 
        }
      );
    }
    
    // Normalize the email data to handle different formats
    const normalizedEmailData = normalizeEmailData(emailData);
    console.log("Normalized homeowner request email data:", JSON.stringify(normalizedEmailData, null, 2));

    // Check if we have either HTML content, text content, or subject (minimum required to process)
    if (!normalizedEmailData.html && !normalizedEmailData.text && !normalizedEmailData.subject) {
      console.error("Email missing required content");
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Missing required content", 
          details: "Email must contain HTML, text content, or at least a subject",
          received_data: normalizedEmailData
        }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 422 
        }
      );
    }

    // Process the email to extract request information
    console.log("Processing email data to extract request information");
    const requestData = await processEmailData(normalizedEmailData);
    console.log("Extracted request data:", requestData);

    // Validate extracted request data has required fields
    if (!requestData || !requestData.title) {
      console.error("Failed to extract required request fields", requestData);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Extraction failed", 
          details: "Could not extract required homeowner request fields (title)",
          partial_data: requestData || {},
          normalized_email: normalizedEmailData
        }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 422 
        }
      );
    }

    // Insert request into the database
    try {
      console.log("Creating homeowner request in database");
      const request = await createRequest(requestData);

      console.log("Homeowner request created successfully:", request);

      return new Response(
        JSON.stringify({ success: true, message: "Homeowner request created", request }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 201 
        }
      );
    } catch (dbError: any) {
      console.error("Database error creating homeowner request:", dbError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Database error", 
          details: dbError.message,
          extracted_data: requestData
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
      JSON.stringify({ 
        success: false, 
        error: "Processing error", 
        details: error.message,
        stack: error.stack
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500 
      }
    );
  }
});
