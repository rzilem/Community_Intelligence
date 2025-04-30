
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { processMultipartFormData, normalizeEmailData } from "./utils/request-parser.ts";
import { processEmail } from "./services/email-processor.ts";
import { createLead } from "./services/lead-service.ts";
import { corsHeaders } from "./utils/cors-headers.ts";
import { simpleParser } from 'https://esm.sh/mailparser@3.6.4';

// Add a configuration flag to prevent modifications
const CURRENT_CONFIG_LOCKED = true;

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') || '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
);

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

    // Process attachments if present
    let pdfUrl = null;
    if (normalizedEmailData.attachments && normalizedEmailData.attachments.length > 0) {
      console.log("Processing attachments:", normalizedEmailData.attachments.length);
      
      // Find the first PDF or Word document attachment
      const attachment = normalizedEmailData.attachments.find(att => 
        att.contentType.includes('pdf') || 
        att.contentType.includes('word') || 
        att.contentType.includes('doc')
      );
      
      if (attachment) {
        console.log("Found document attachment:", attachment.filename);
        
        // Generate a unique filename
        const fileExt = attachment.filename.substring(attachment.filename.lastIndexOf('.'));
        const fileName = `invoice_${Date.now()}${fileExt}`;
        
        // Upload to storage - FIX: Upload directly to invoices bucket without 'public/' subfolder
        try {
          const { error: uploadError } = await supabase.storage
            .from('invoices')
            .upload(fileName, Buffer.from(attachment.content, 'base64'), {
              contentType: attachment.contentType,
              upsert: true
            });
            
          if (uploadError) {
            console.error("Error uploading attachment:", uploadError);
          } else {
            // Get public URL
            const { data: urlData } = supabase.storage
              .from('invoices')
              .getPublicUrl(fileName);
              
            pdfUrl = urlData.publicUrl;
            console.log("Attachment uploaded successfully:", pdfUrl);
          }
        } catch (storageError) {
          console.error("Storage error:", storageError);
        }
      }
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
      // If we have a PDF URL, add it to the lead data
      if (pdfUrl) {
        leadData.pdf_url = pdfUrl;
      }
      
      // If the HTML content is just a placeholder, don't save it
      if (normalizedEmailData.html && normalizedEmailData.html.includes('See what happens')) {
        leadData.html_content = null;
      }
      
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
