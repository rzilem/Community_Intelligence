
import { normalizeEmailData } from "../utils/email-normalizer.ts";
import { LoggingService } from "./logging-service.ts";
import { processAttachments } from "./attachment-processor.ts";
import { corsHeaders } from "../utils/cors-headers.ts";
import { analyzeInvoiceWithAI } from "./ai-analyzer.ts";
import { processInvoiceEmail } from "./invoice-processor.ts";

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
    
    // Process the invoice with AI analysis
    await loggingService.logInfo(requestId, "Starting invoice processing with AI analysis", {});
    
    try {
      // Use the existing processInvoiceEmail function which includes AI analysis
      const processedInvoice = await processInvoiceEmail(normalizedEmailData);
      await loggingService.logInfo(requestId, "Successfully processed invoice with AI", {
        has_vendor: !!processedInvoice.vendor,
        has_amount: !!processedInvoice.amount,
        has_invoice_number: !!processedInvoice.invoice_number
      });
      
      // Extract invoice information from email content
      const invoiceData = {
        invoice_number: processedInvoice.invoice_number || normalizedEmailData.subject || "Unknown",
        vendor: processedInvoice.vendor || normalizedEmailData.from || "Unknown Vendor",
        amount: processedInvoice.amount || 0,
        due_date: processedInvoice.due_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        invoice_date: processedInvoice.invoice_date || new Date().toISOString().split('T')[0],
        status: "pending",
        html_content: normalizedEmailData.html,
        email_content: normalizedEmailData.text,
        pdf_url: attachmentResult.pdfUrl || processedInvoice.pdf_url,
        description: processedInvoice.description || "Invoice received via email",
        tracking_number: normalizedEmailData.tracking_number || processedInvoice.tracking_number
      };
      
      return {
        success: true,
        invoiceData
      };
    } catch (aiError) {
      await loggingService.logError(requestId, "Error during AI processing of invoice", aiError);
      
      // Fallback to basic extraction if AI fails
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
    }
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
