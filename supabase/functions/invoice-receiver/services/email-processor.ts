
import { normalizeEmailData } from "../utils/email-normalizer.ts";
import { LoggingService } from "./logging-service.ts";
import { processAttachments } from "./attachment-processor.ts";
import { corsHeaders } from "../utils/cors-headers.ts";

export async function handleEmailData(emailData: any, requestId: string, loggingService: LoggingService, supabase: any) {
  try {
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
    const attachmentResult = await processAttachments(normalizedEmailData, requestId, loggingService, supabase);
    
    // Log the HTML content length for debugging
    if (normalizedEmailData.html) {
      await loggingService.logInfo(requestId, "HTML content details", {
        htmlContentLength: normalizedEmailData.html.length,
        htmlContentExcerpt: normalizedEmailData.html.substring(0, 100) + '...'
      });
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
      pdf_url: attachmentResult.pdfUrl,
      description: "Invoice received via email",
      tracking_number: normalizedEmailData.tracking_number
    };

    return {
      success: true,
      invoiceData
    };
  } catch (error: any) {
    await loggingService.logError(requestId, "Error processing email data", error);
    return {
      success: false,
      response: new Response(
        JSON.stringify({ 
          success: false, 
          error: "Error processing email", 
          details: error.message 
        }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500 
        }
      )
    };
  }
}
