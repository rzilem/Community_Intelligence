
import { corsHeaders } from "../utils/cors-headers.ts";
import { processMultipartFormData, normalizeEmailData } from "../utils/request-parser.ts";
import { processInvoiceEmail } from "../services/invoice-processor.ts";
import { createInvoice } from "../services/invoice-service.ts";
import { LoggingService } from "../services/logging-service.ts";
import { FileStorageService } from "../services/file-storage-service.ts";

/**
 * Core handler for invoice email processing
 */
export async function handleInvoiceEmail(req: Request, supabase: any): Promise<Response> {
  const requestId = `req_${Date.now()}`;
  const loggingService = new LoggingService(supabase);
  const fileStorageService = new FileStorageService(supabase, loggingService);
  
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    await loggingService.logInfo(requestId, 'Received invoice email', {
      contentType: req.headers.get("content-type"),
      headers: Object.fromEntries([...req.headers.entries()])
    });

    const reqCopy = req.clone();
    try {
      const rawText = await reqCopy.text();
      await loggingService.logInfo(requestId, 'Raw request body', {
        length: rawText.length,
        snippet: rawText.length < 1000 ? rawText : rawText.substring(0, 1000) + "..."
      });
    } catch (e) {
      console.log(`[${requestId}] Could not read raw request body: ${(e as Error).message}`);
    }

    // Extract email data from request
    const emailData = await extractEmailData(req, requestId, loggingService);
    if (!emailData) {
      return createErrorResponse("Empty email data", 
        "The email webhook payload was empty or invalid", 400);
    }

    // Normalize the email data
    const normalizedEmailData = normalizeEmailData(emailData);
    await logEmailData(normalizedEmailData, requestId, loggingService);

    // Validate email has required content
    if (!normalizedEmailData.html && !normalizedEmailData.text && !normalizedEmailData.subject) {
      await loggingService.logError(requestId, 'Email missing required content', new Error("Missing content"));
      return createErrorResponse("Missing required content", 
        "Email must contain HTML, text content, or at least a subject", 422);
    }

    // Process attachments
    let pdfUrl: string | null = null;
    if (normalizedEmailData.attachments && normalizedEmailData.attachments.length > 0) {
      await loggingService.logInfo(requestId, 'Processing attachments', 
        { count: normalizedEmailData.attachments.length });
      
      const attachment = normalizedEmailData.attachments.find(att =>
        att.contentType.includes('pdf') || att.contentType.includes('word') || att.contentType.includes('doc')
      );

      if (attachment) {
        pdfUrl = await fileStorageService.processAttachment(requestId, attachment);
      }
    }

    // Process the email to extract invoice data
    await loggingService.logInfo(requestId, 'Processing invoice email to extract data', {});
    const invoiceData = await processInvoiceEmail(normalizedEmailData);
    await loggingService.logInfo(requestId, 'Extracted invoice data', {
      invoiceNumber: invoiceData.invoice_number,
      vendor: invoiceData.vendor,
      pdfUrl: invoiceData.pdf_url
    });

    // Create the invoice in the database
    try {
      if (pdfUrl) {
        invoiceData.pdf_url = pdfUrl;
      }
      
      const invoice = await createInvoice(invoiceData);
      await loggingService.logInfo(requestId, 'Invoice created successfully', {
        id: invoice.id,
        trackingNumber: invoice.tracking_number
      });

      // Return appropriate response based on data quality
      if (!invoiceData.vendor || invoiceData.vendor === "Unknown Vendor" || 
          !invoiceData.amount || invoiceData.amount === 0) {
        return new Response(JSON.stringify({
          success: true,
          warning: "Invoice created with partial data",
          message: "Invoice was created but may need manual review",
          invoice
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 201
        });
      }

      return new Response(JSON.stringify({
        success: true,
        message: "Invoice created",
        invoice
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 201
      });
    } catch (dbError) {
      await loggingService.logError(requestId, 'Database error creating invoice', dbError as Error, {
        extractedData: invoiceData
      });
      return new Response(JSON.stringify({
        success: false,
        error: "Database error",
        details: (dbError as Error).message,
        extracted_data: invoiceData
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500
      });
    }
  } catch (error) {
    await loggingService.logError(requestId, 'Error handling invoice email', error as Error);
    return new Response(JSON.stringify({
      success: false,
      error: "Processing error",
      details: (error as Error).message
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500
    });
  }
}

/**
 * Helper function to extract email data from request
 */
async function extractEmailData(req: Request, requestId: string, loggingService: LoggingService): Promise<any> {
  try {
    const emailData = await processMultipartFormData(req);
    await loggingService.logInfo(requestId, 'Processed form data', { keys: Object.keys(emailData) });
    return emailData;
  } catch (parseError) {
    await loggingService.logError(requestId, 'Error parsing request body', parseError as Error);
    try {
      const jsonReqCopy = req.clone();
      const jsonData = await jsonReqCopy.json();
      console.log(`[${requestId}] Successfully parsed as JSON fallback`);
      return jsonData;
    } catch (jsonError) {
      await loggingService.logError(requestId, 'Error parsing request as JSON', jsonError as Error);
      throw new Error(`Invalid request format: ${(parseError as Error).message}, then ${(jsonError as Error).message}`);
    }
  }
}

/**
 * Helper function to log email data
 */
async function logEmailData(normalizedEmailData: any, requestId: string, loggingService: LoggingService): Promise<void> {
  console.log(`[${requestId}] Normalized invoice email data`, {
    from: normalizedEmailData.from,
    to: normalizedEmailData.to,
    subject: normalizedEmailData.subject,
    hasHtml: !!normalizedEmailData.html,
    hasText: !!normalizedEmailData.text,
    attachmentsCount: normalizedEmailData.attachments?.length
  });
  
  await loggingService.logInfo(requestId, 'Normalized invoice email data', {
    from: normalizedEmailData.from,
    subject: normalizedEmailData.subject,
    attachmentsCount: normalizedEmailData.attachments?.length
  });
}

/**
 * Helper function to create error responses
 */
function createErrorResponse(error: string, details: string, status = 400): Response {
  return new Response(JSON.stringify({
    success: false,
    error,
    details
  }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status
  });
}
