
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { processMultipartFormData, normalizeEmailData } from "../utils/request-parser.ts";
import { LoggingService } from "../services/logging-service.ts";

// CORS headers for all responses
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

export async function handleInvoiceEmail(req: Request, supabase: any): Promise<Response> {
  // Generate a unique request ID for tracking
  const requestId = crypto.randomUUID();
  const loggingService = new LoggingService(supabase);
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  try {
    await loggingService.logInfo(requestId, "Received invoice email webhook", { method: req.method });
    
    // Get email data from request - handle both JSON and multipart form data
    let emailData;
    
    try {
      emailData = await processMultipartFormData(req);
      await loggingService.logInfo(requestId, "Successfully processed request data", { 
        dataType: "multipart", 
        keysFound: Object.keys(emailData) 
      });
    } catch (parseError) {
      await loggingService.logError(requestId, "Error parsing request", parseError);
      
      // Clone the request before attempting to parse as JSON
      const clonedRequest = req.clone();
      
      try {
        // Fallback to regular JSON parsing
        emailData = await clonedRequest.json();
        await loggingService.logInfo(requestId, "Successfully parsed request as JSON");
      } catch (jsonError) {
        await loggingService.logError(requestId, "Error parsing request as JSON", jsonError);
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: "Invalid request format",
            message: "Could not parse request body as multipart form data or JSON"
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
      await loggingService.logError(requestId, "Empty email data received", new Error("Email webhook payload was empty"));
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
    await loggingService.logInfo(requestId, "Normalized email data", { 
      subject: normalizedEmailData.subject,
      from: normalizedEmailData.from,
      to: normalizedEmailData.to,
      hasHtml: !!normalizedEmailData.html,
      hasText: !!normalizedEmailData.text,
      attachmentsCount: normalizedEmailData.attachments?.length || 0
    });

    // Process attachments if present
    let pdfUrl = null;
    if (normalizedEmailData.attachments && normalizedEmailData.attachments.length > 0) {
      await loggingService.logInfo(requestId, "Processing attachments", { 
        count: normalizedEmailData.attachments.length 
      });
      
      // Find the first PDF or Word document attachment
      const attachment = normalizedEmailData.attachments.find(att => 
        (att.contentType && att.contentType.includes('pdf')) || 
        (att.contentType && att.contentType.includes('word')) || 
        (att.contentType && att.contentType.includes('doc'))
      );
      
      if (attachment) {
        await loggingService.logInfo(requestId, "Found document attachment", {
          filename: attachment.filename,
          contentType: attachment.contentType
        });
        
        // Generate a unique filename
        const fileExt = attachment.filename.substring(attachment.filename.lastIndexOf('.'));
        const fileName = `invoice_${Date.now()}${fileExt}`;
        
        try {
          // Upload to storage
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('invoices')
            .upload(fileName, attachment.content, {
              contentType: attachment.contentType,
              upsert: true
            });
            
          if (uploadError) {
            await loggingService.logError(requestId, "Error uploading attachment", uploadError);
          } else {
            // Get public URL
            const { data: urlData } = supabase.storage
              .from('invoices')
              .getPublicUrl(fileName);
              
            pdfUrl = urlData.publicUrl;
            await loggingService.logInfo(requestId, "Attachment uploaded successfully", { url: pdfUrl });
          }
        } catch (storageError) {
          await loggingService.logError(requestId, "Storage error", storageError);
        }
      } else {
        await loggingService.logInfo(requestId, "No PDF/Word attachments found in email");
      }
    } else {
      await loggingService.logInfo(requestId, "No attachments to process");
    }

    // Extract invoice information from email content
    const invoiceData = {
      invoice_number: normalizedEmailData.subject || "Unknown",
      vendor: normalizedEmailData.from || "Unknown Vendor",
      amount: 0,
      due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      invoice_date: new Date().toISOString().split('T')[0],
      status: "pending",
      html_content: normalizedEmailData.html,
      email_content: normalizedEmailData.text,
      pdf_url: pdfUrl,
      description: "Invoice received via email",
      tracking_number: normalizedEmailData.tracking_number
    };

    // Insert invoice into database
    try {
      const { data: invoice, error: insertError } = await supabase
        .from('invoices')
        .insert(invoiceData)
        .select();
      
      if (insertError) {
        await loggingService.logError(requestId, "Error inserting invoice", insertError);
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: "Database error", 
            details: insertError.message 
          }),
          { 
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 500 
          }
        );
      }
      
      await loggingService.logInfo(requestId, "Invoice created successfully", { id: invoice[0].id });
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Invoice created", 
          invoice: invoice[0] 
        }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 201 
        }
      );
    } catch (dbError: any) {
      await loggingService.logError(requestId, "Database error creating invoice", dbError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Database error", 
          details: dbError.message 
        }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500 
        }
      );
    }
  } catch (error: any) {
    await loggingService.logError(requestId, "Unhandled error processing invoice email", error);
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
}
