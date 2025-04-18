
import { DOMParser } from "https://deno.land/x/deno_dom@v0.1.38/deno-dom-wasm.ts";
import { extractVendorInformation } from "./extractors/vendor-extractor.ts";
import { extractInvoiceDetails } from "./extractors/invoice-details-extractor.ts";
import { extractAssociationInformation } from "./extractors/association-extractor.ts";
import { analyzeInvoiceWithAI } from "./ai-analyzer.ts";
import { cleanupInvoiceData } from "./utils/invoice-cleanup.ts";
import { processDocument } from "./document-processor.ts";
import { processHtmlContent } from "./html-processor.ts";
import { Invoice } from "../types/invoice-types.ts";

export async function processInvoiceEmail(emailData: any): Promise<Invoice> {
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
    
    // Save the original HTML content
    invoice.html_content = rawHtmlContent;
    
    // Process attachments and documents
    const { documentContent, processedAttachment } = await processDocument(emailData.attachments);
    if (processedAttachment) {
      invoice.source_document = processedAttachment.filename;
      invoice.pdf_url = processedAttachment.url;
    }
    
    // Process HTML content if no document content
    const content = await processHtmlContent(documentContent, rawHtmlContent, rawTextContent, subject);
    console.log("Processing content excerpt:", content.substring(0, 200));
    
    // Extract information using specialized extractors
    const vendorInfo = extractVendorInformation(content, from);
    const invoiceDetails = extractInvoiceDetails(content, subject);
    const associationInfo = extractAssociationInformation(content);
    
    // Merge extracted information
    Object.assign(invoice, vendorInfo, invoiceDetails, associationInfo);

    // Use AI to enhance extraction if we have enough content
    if (content && content.length > 100) {
      try {
        console.log("Using AI to enhance invoice data extraction");
        const aiExtractedData = await analyzeInvoiceWithAI(content, subject, from);
        
        if (aiExtractedData) {
          console.log("AI extraction successful, merging data");
          Object.keys(aiExtractedData).forEach(key => {
            if (!invoice[key] || 
                (typeof aiExtractedData[key] === 'string' && 
                 aiExtractedData[key].length > (invoice[key]?.length || 0))) {
              invoice[key] = aiExtractedData[key];
            }
          });
        }
      } catch (aiError) {
        console.error("AI extraction failed, continuing with rule-based extraction:", aiError);
      }
    }

    // Clean up and validate invoice data
    return cleanupInvoiceData(invoice, processedAttachment, subject, content);
  } catch (error) {
    console.error("Error processing invoice email:", error);
    throw new Error(`Failed to process invoice email: ${error.message}`);
  }
}
