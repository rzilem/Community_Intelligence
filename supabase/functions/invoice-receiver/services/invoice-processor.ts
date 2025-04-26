
import { DOMParser } from "https://deno.land/x/deno_dom@v0.1.38/deno-dom-wasm.ts";
import { extractVendorInformation } from "./extractors/vendor-extractor.ts";
import { extractInvoiceDetails } from "./extractors/invoice-details-extractor.ts";
import { extractAssociationInformation } from "./extractors/association-extractor.ts";
import { analyzeInvoiceWithAI } from "./ai-analyzer.ts";
import { cleanupInvoiceData } from "./utils/invoice-cleanup.ts";
import { processDocument } from "./document-processor.ts";
import { processHtmlContent } from "./html-processor.ts";

export async function processInvoiceEmail(emailData: any) {
  console.log("Processing invoice email data");
  
  const invoice: Record<string, any> = {
    status: 'pending',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  try {
    // Extract basic email data
    const from = emailData.from || emailData.From || emailData.sender || emailData.Sender || "";
    const subject = emailData.subject || emailData.Subject || "";
    const rawHtmlContent = emailData.html || emailData.Html || emailData.body || emailData.Body || "";
    const rawTextContent = emailData.text || emailData.Text || emailData.plain || emailData.Plain || "";

    console.log("Processing email:", {
      from,
      subject,
      hasHtml: !!rawHtmlContent,
      hasText: !!rawTextContent,
      attachments: emailData.attachments?.length || 0
    });
    
    // If we have a subject, use it to improve invoice data
    if (subject) {
      console.log("Using email subject for invoice data:", subject);
      invoice.description = subject;
      
      // Try to extract invoice number from subject
      const invoiceNumMatch = subject.match(/inv[-\s#:]*(\d+)/i) || subject.match(/invoice[-\s#:]*(\d+)/i);
      if (invoiceNumMatch && invoiceNumMatch[1]) {
        invoice.invoice_number = invoiceNumMatch[1];
        console.log("Extracted invoice number from subject:", invoice.invoice_number);
      }
    }
    
    // If we have a sender email, use it to improve vendor info
    if (from) {
      const vendorMatch = from.match(/([^<@]+)(?:\s+<|\s+\(|@)/);
      if (vendorMatch && vendorMatch[1]) {
        invoice.vendor = vendorMatch[1].trim();
        console.log("Extracted vendor from email sender:", invoice.vendor);
      }
    }
    
    // Process attachments and documents first
    const { documentContent, processedAttachment } = await processDocument(emailData.attachments);
    
    if (processedAttachment) {
      console.log("Attachment processed successfully:", {
        filename: processedAttachment.filename,
        url: processedAttachment.url
      });
      
      invoice.source_document = processedAttachment.filename;
      invoice.pdf_url = processedAttachment.url;
    } else {
      console.log("No valid attachments processed");
    }
    
    // Process HTML content if no document content
    const content = await processHtmlContent(documentContent, rawHtmlContent, rawTextContent, subject);
    
    // Extract information using specialized extractors
    const vendorInfo = extractVendorInformation(content, from);
    const invoiceDetails = extractInvoiceDetails(content, subject);
    const associationInfo = extractAssociationInformation(content);
    
    // Merge extracted information
    Object.assign(invoice, vendorInfo, invoiceDetails, associationInfo);

    // Skip saving placeholder HTML content
    if (rawHtmlContent && !rawHtmlContent.includes('See what happens')) {
      invoice.html_content = rawHtmlContent;
    }

    // If no vendor info could be extracted, use a placeholder
    if (!invoice.vendor) {
      if (from) {
        // Try to extract vendor name from email address
        const emailMatch = from.match(/([^@<\s]+)@/);
        if (emailMatch && emailMatch[1]) {
          const possibleVendor = emailMatch[1].charAt(0).toUpperCase() + emailMatch[1].slice(1);
          invoice.vendor = possibleVendor;
          console.log("Using email domain as vendor:", invoice.vendor);
        } else {
          invoice.vendor = "Unknown Vendor";
        }
      } else {
        invoice.vendor = "Unknown Vendor";
      }
    }

    // Clean up and validate invoice data
    const cleanedInvoice = cleanupInvoiceData(invoice, processedAttachment, subject, content);
    
    // Ensure we always have an invoice number
    if (!cleanedInvoice.invoice_number) {
      cleanedInvoice.invoice_number = `INV-${Date.now().toString().slice(-6)}`;
      console.log("Generated invoice number:", cleanedInvoice.invoice_number);
    }
    
    // Log final invoice data
    console.log("Extracted invoice data:", cleanedInvoice);

    return cleanedInvoice;
  } catch (error) {
    console.error("Error processing invoice email:", error);
    throw new Error(`Failed to process invoice email: ${error.message}`);
  }
}
