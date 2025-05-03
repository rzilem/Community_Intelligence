
import { log } from "../utils/logging.ts";
import { processDocument } from "./document-processor.ts";

// Update this import to include the request ID
export async function processInvoiceEmail(emailData: any, requestId: string) {
  try {
    await log({
      request_id: requestId,
      level: 'info',
      message: 'Beginning invoice email processing'
    });
    
    // Extract basic fields
    const from = typeof emailData.from === 'object' ? emailData.from.address : emailData.from;
    const subject = emailData.subject || '';
    const textContent = emailData.text || '';
    const htmlContent = emailData.html || '';
    
    await log({
      request_id: requestId,
      level: 'info',
      message: 'Extracted basic email fields',
      metadata: {
        from,
        subject: subject.substring(0, 100),
        hasText: !!textContent,
        hasHtml: !!htmlContent
      }
    });
    
    // Process attachments
    const { processedAttachment } = await processDocument(emailData.attachments, requestId);
    
    // Extract vendorName from email or subject
    let vendorName = "Unknown Vendor";
    if (from) {
      // Extract domain from email
      const emailDomain = from.split('@')[1];
      if (emailDomain) {
        // Convert domain to vendor name (e.g., xyz.com -> XYZ)
        vendorName = emailDomain.split('.')[0].toUpperCase();
      }
    }
    
    // Try to extract from subject if available
    if (subject && subject.length > 3) {
      // Look for company name patterns in subject
      const companyPatterns = [
        /from ([\w\s&]+?)(?::|$)/i,
        /([\w\s&]+?) invoice/i,
        /invoice from ([\w\s&]+)/i
      ];
      
      for (const pattern of companyPatterns) {
        const match = subject.match(pattern);
        if (match && match[1] && match[1].length > 2) {
          vendorName = match[1].trim();
          break;
        }
      }
    }
    
    await log({
      request_id: requestId,
      level: 'info',
      message: 'Extracted vendor information',
      metadata: {
        vendorName,
        from
      }
    });
    
    // Extract invoice number from subject or content
    let invoiceNumber = '';
    const invoiceNumberPatterns = [
      /invoice\s*#?\s*([A-Z0-9\-]+)/i,
      /invoice\s*number\s*[:|\s]\s*([A-Z0-9\-]+)/i,
      /order\s*#?\s*([A-Z0-9\-]+)/i,
      /#\s*([A-Z0-9\-]+)/i
    ];
    
    // First check subject
    for (const pattern of invoiceNumberPatterns) {
      const match = subject.match(pattern);
      if (match && match[1]) {
        invoiceNumber = match[1].trim();
        break;
      }
    }
    
    // If not found, check text content
    if (!invoiceNumber && textContent) {
      for (const pattern of invoiceNumberPatterns) {
        const match = textContent.match(pattern);
        if (match && match[1]) {
          invoiceNumber = match[1].trim();
          break;
        }
      }
    }
    
    // Generate a random invoice number if extraction failed
    if (!invoiceNumber) {
      invoiceNumber = `INV-${Date.now().toString().slice(-6)}`;
    }
    
    await log({
      request_id: requestId,
      level: 'info',
      message: 'Extracted invoice number',
      metadata: {
        invoiceNumber,
        wasExtracted: !!invoiceNumber
      }
    });
    
    // Extract amount from subject or text
    let amount = 0;
    const amountPatterns = [
      /\$\s*([\d,]+\.?\d*)/,
      /amount\s*:?\s*\$\s*([\d,]+\.?\d*)/i,
      /total\s*:?\s*\$\s*([\d,]+\.?\d*)/i,
      /usd\s*([\d,]+\.?\d*)/i
    ];
    
    // Check subject first
    for (const pattern of amountPatterns) {
      const match = subject.match(pattern);
      if (match && match[1]) {
        amount = parseFloat(match[1].replace(/,/g, ''));
        break;
      }
    }
    
    // If not found, check text content
    if (amount === 0 && textContent) {
      for (const pattern of amountPatterns) {
        const match = textContent.match(pattern);
        if (match && match[1]) {
          amount = parseFloat(match[1].replace(/,/g, ''));
          break;
        }
      }
    }
    
    await log({
      request_id: requestId,
      level: 'info',
      message: 'Extracted invoice amount',
      metadata: {
        amount,
        wasExtracted: amount > 0
      }
    });
    
    // Extract dates - this could be improved with more advanced parsing
    const today = new Date();
    const invoiceDate = today.toISOString().split('T')[0];
    
    // Due date estimation (typically 30 days from invoice date)
    const dueDate = new Date(today);
    dueDate.setDate(dueDate.getDate() + 30);
    const dueDateStr = dueDate.toISOString().split('T')[0];
    
    // Build the invoice data object - REMOVE email_content field
    const invoiceData = {
      invoice_number: invoiceNumber,
      vendor: vendorName,
      amount: amount,
      invoice_date: invoiceDate,
      due_date: dueDateStr,
      description: subject,
      pdf_url: processedAttachment?.public_url || null,
      html_content: htmlContent || null,
      // Removed the 'email_content' field that's causing the error
      status: 'pending',
    };
    
    await log({
      request_id: requestId,
      level: 'info',
      message: 'Invoice data extraction complete',
      metadata: {
        invoiceNumber,
        vendor: vendorName,
        amount,
        hasPdf: !!processedAttachment?.public_url
      }
    });
    
    return invoiceData;
  } catch (error) {
    await log({
      request_id: requestId,
      level: 'error',
      message: 'Error processing invoice email',
      metadata: {
        error: error.message,
        stack: error.stack
      }
    });
    throw error;
  }
}
