
import { extractVendorInformation } from "./extractors/vendor-extractor.ts";
import { extractInvoiceDetails } from "./extractors/invoice-details-extractor.ts";
import { extractAssociationInformation } from "./extractors/association-extractor.ts";
import { cleanupInvoiceData } from "./utils/invoice-cleanup.ts";
import { processDocument } from "./document-processor.ts";
import { ContentExtractionService } from "./content-extraction-service.ts";
import { Invoice } from "../types/invoice-types.ts"; // Updated import path
import { Attachment } from "./invoice-types.ts";

export async function processInvoiceEmail(emailData: any): Promise<Partial<Invoice>> {
  const requestId = emailData.tracking_number || `email_${Date.now()}`;
  console.log(`[${requestId}] Processing invoice email data`);

  const invoice: Partial<Invoice> = {
    status: 'pending',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  try {
    const from = emailData.from || emailData.From || emailData.sender || emailData.Sender || "";
    const subject = emailData.subject || emailData.Subject || "";
    const rawHtmlContent = emailData.html || emailData.Html || emailData.body || emailData.Body || "";
    const rawTextContent = emailData.text || emailData.Text || emailData.plain || emailData.Plain || "";

    console.log(`[${requestId}] Processing email`, {
      from,
      subject,
      hasHtml: !!rawHtmlContent,
      hasText: !!rawTextContent,
      attachments: emailData.attachments?.length || 0
    });

    // Capture email_content
    if (rawTextContent) {
      invoice.email_content = rawTextContent;
    } else if (rawHtmlContent) {
      invoice.email_content = rawHtmlContent;
    }

    if (subject) {
      console.log(`[${requestId}] Using email subject for invoice data: ${subject}`);
      invoice.description = subject;
      const invoiceNumMatch = subject.match(/inv[-\s#:]*(\d+)/i) || subject.match(/invoice[-\s#:]*(\d+)/i);
      if (invoiceNumMatch && invoiceNumMatch[1]) {
        invoice.invoice_number = invoiceNumMatch[1];
        console.log(`[${requestId}] Extracted invoice number from subject: ${invoice.invoice_number}`);
      }
    }

    if (from) {
      const vendorMatch = from.match(/([^<@]+)(?:\s+<|\s+\(|@)/);
      if (vendorMatch && vendorMatch[1]) {
        invoice.vendor = vendorMatch[1].trim();
        console.log(`[${requestId}] Extracted vendor from email sender: ${invoice.vendor}`);
      }
    }

    const { documentContent, processedAttachment } = await processDocument(emailData.attachments);
    if (processedAttachment) {
      console.log(`[${requestId}] Attachment processed`, {
        filename: processedAttachment.filename,
        url: processedAttachment.url
      });
      invoice.source_document = processedAttachment.filename;
      invoice.pdf_url = processedAttachment.url;
    } else {
      console.log(`[${requestId}] No valid attachments processed`);
    }

    // Use content extraction service to get the best content
    const contentExtractor = new ContentExtractionService();
    const content = contentExtractor.getBestAvailableContent(
      documentContent, 
      rawHtmlContent, 
      rawTextContent, 
      subject
    );
    
    // Extract information from content
    const vendorInfo = extractVendorInformation(content, from);
    const invoiceDetails = extractInvoiceDetails(content, subject);
    const associationInfo = extractAssociationInformation(content);

    Object.assign(invoice, vendorInfo, invoiceDetails, associationInfo);

    if (rawHtmlContent && !rawHtmlContent.includes('See what happens')) {
      invoice.html_content = rawHtmlContent;
    }

    if (!invoice.vendor) {
      if (from) {
        const emailMatch = from.match(/([^@<\s]+)@/);
        if (emailMatch && emailMatch[1]) {
          const possibleVendor = emailMatch[1].charAt(0).toUpperCase() + emailMatch[1].slice(1);
          invoice.vendor = possibleVendor;
          console.log(`[${requestId}] Using email domain as vendor: ${invoice.vendor}`);
        } else {
          invoice.vendor = "Unknown Vendor";
        }
      } else {
        invoice.vendor = "Unknown Vendor";
      }
    }

    const cleanedInvoice = cleanupInvoiceData(invoice, processedAttachment as any, subject, content);
    if (!cleanedInvoice.invoice_number) {
      cleanedInvoice.invoice_number = `INV-${Date.now().toString().slice(-6)}`;
      console.log(`[${requestId}] Generated invoice number: ${cleanedInvoice.invoice_number}`);
    }

    console.log(`[${requestId}] Extracted invoice data`, cleanedInvoice);
    return cleanedInvoice;
  } catch (error: any) {
    console.error(`[${requestId}] Error processing invoice email: ${error.message}`);
    throw new Error(`Failed to process invoice email: ${error.message}`);
  }
}
