
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

    // Clean up and validate invoice data
    return cleanupInvoiceData(invoice, processedAttachment, subject, content);
  } catch (error) {
    console.error("Error processing invoice email:", error);
    throw new Error(`Failed to process invoice email: ${error.message}`);
  }
}
