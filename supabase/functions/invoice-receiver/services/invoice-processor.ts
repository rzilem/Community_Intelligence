
import { DOMParser } from "https://deno.land/x/deno_dom@v0.1.38/deno-dom-wasm.ts";
import { extractVendorInformation } from "./extractors/vendor-extractor.ts";
import { extractInvoiceDetails } from "./extractors/invoice-details-extractor.ts";
import { extractAssociationInformation } from "./extractors/association-extractor.ts";
import { 
  extractTextFromPdf, 
  extractTextFromDocx, 
  extractTextFromDoc, 
  getDocumentType 
} from "../utils/document-parser.ts";

export async function processInvoiceEmail(emailData: any) {
  console.log("Processing invoice email data");
  
  // Initialize invoice with default values
  const invoice: Record<string, any> = {
    status: 'pending',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  try {
    // Extract from, subject and raw content from the email
    const from = emailData.from || emailData.From || emailData.sender || emailData.Sender || "";
    const subject = emailData.subject || emailData.Subject || "";
    const rawHtmlContent = emailData.html || emailData.Html || emailData.body || emailData.Body || "";
    const rawTextContent = emailData.text || emailData.Text || emailData.plain || emailData.Plain || "";
    
    // Save the original HTML content
    invoice.html_content = rawHtmlContent;
    
    // Check if we have any attachments to process
    let documentContent = "";
    let processedAttachment = null;
    
    if (emailData.attachments && emailData.attachments.length > 0) {
      console.log(`Found ${emailData.attachments.length} attachments to process`);
      
      // Look for PDF or Word documents in the attachments
      for (const attachment of emailData.attachments) {
        console.log(`Processing attachment: ${attachment.filename}, type: ${attachment.contentType}`);
        
        const documentType = getDocumentType(attachment.filename);
        
        if (documentType !== "unknown") {
          console.log(`Found document attachment: ${attachment.filename}, type: ${documentType}`);
          
          // Extract text based on document type
          let extractedText = "";
          
          switch (documentType) {
            case "pdf":
              extractedText = await extractTextFromPdf(attachment.content);
              break;
            case "docx":
              extractedText = await extractTextFromDocx(attachment.content);
              break;
            case "doc":
              extractedText = await extractTextFromDoc(attachment.content);
              break;
          }
          
          if (extractedText && extractedText.length > 0) {
            console.log(`Successfully extracted text from ${attachment.filename}, length: ${extractedText.length}`);
            documentContent = extractedText;
            processedAttachment = attachment;
            break; // Use the first successful document extraction
          }
        }
      }
    }
    
    // Parse HTML content if no document content was extracted
    let parsedText = documentContent || rawTextContent;
    if (!documentContent && rawHtmlContent) {
      try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(rawHtmlContent, "text/html");
        if (doc && doc.body) {
          parsedText = doc.body.textContent || rawTextContent;
        }
      } catch (error) {
        console.error("Error parsing HTML:", error);
      }
    }
    
    // Extract content from document, HTML, or fallback to text content or subject
    const content = documentContent || parsedText || rawTextContent || subject;
    
    // Debug the content being processed
    console.log("Processing content excerpt:", content.substring(0, 200));
    
    // Extract invoice details using specialized extractors
    const vendorInfo = extractVendorInformation(content, from);
    const invoiceDetails = extractInvoiceDetails(content, subject);
    const associationInfo = extractAssociationInformation(content);
    
    // Merge all extracted information into the invoice object
    Object.assign(invoice, vendorInfo, invoiceDetails, associationInfo);

    // If we processed an attachment, add the filename to the description
    if (processedAttachment) {
      invoice.source_document = processedAttachment.filename;
      
      // Add document info to description
      if (invoice.description) {
        invoice.description += `\n\nExtracted from document: ${processedAttachment.filename}`;
      } else {
        invoice.description = `Extracted from document: ${processedAttachment.filename}`;
      }
    }

    // Default values for required fields
    if (!invoice.invoice_number) {
      // Generate a random invoice number if not found
      invoice.invoice_number = `INV-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
    }
    
    if (!invoice.vendor) {
      // Try to extract vendor from email domain
      const emailDomain = from.match(/@([^.]+)\./);
      if (emailDomain && emailDomain[1]) {
        invoice.vendor = emailDomain[1].charAt(0).toUpperCase() + emailDomain[1].slice(1);
      } else {
        invoice.vendor = "Unknown Vendor";
      }
    }
    
    // Add subject and excerpt to description
    if (subject) {
      if (invoice.description) {
        invoice.description = `Subject: ${subject}\n\n${invoice.description}`;
      } else {
        invoice.description = `Subject: ${subject}\n\n`;
        
        if (content) {
          invoice.description += `Content: ${content.substring(0, 500)}${content.length > 500 ? '...' : ''}`;
        }
      }
    }
    
    // Set default dates if not extracted
    if (!invoice.invoice_date) {
      invoice.invoice_date = new Date().toISOString().split('T')[0]; // Today's date
    }
    
    if (!invoice.due_date) {
      // Due date is 30 days from invoice date by default
      const dueDate = new Date(invoice.invoice_date);
      dueDate.setDate(dueDate.getDate() + 30);
      invoice.due_date = dueDate.toISOString().split('T')[0];
    }
    
    console.log("Extracted invoice data:", invoice);
    return invoice;
  } catch (error) {
    console.error("Error processing invoice email:", error);
    throw new Error(`Failed to process invoice email: ${error.message}`);
  }
}
