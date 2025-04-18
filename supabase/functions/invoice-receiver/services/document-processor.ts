
import { 
  extractTextFromPdf, 
  extractTextFromDocx, 
  extractTextFromDoc, 
  getDocumentType 
} from "../utils/document-parser.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') || '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
);

export async function processDocument(attachments: any[] = []) {
  let documentContent = "";
  let processedAttachment = null;

  if (!attachments || attachments.length === 0) {
    console.log("No attachments to process");
    return { documentContent: "", processedAttachment: null };
  }

  console.log(`Processing ${attachments.length} attachments`, attachments.map(a => ({ 
    filename: a.filename, 
    contentType: a.contentType,
    hasContent: !!a.content,
    contentLength: a.content ? a.content.length : 0
  })));
  
  for (const attachment of attachments) {
    console.log(`Examining attachment: ${attachment.filename} (${attachment.contentType})`);
    
    if (!attachment.content) {
      console.warn(`No content for attachment: ${attachment.filename}`);
      continue;
    }

    if (typeof attachment.content !== 'string' || attachment.content.length === 0) {
      console.warn(`Invalid content for attachment ${attachment.filename}: Type: ${typeof attachment.content}, Length: ${attachment.content ? attachment.content.length : 0}`);
      continue;
    }

    const documentType = getDocumentType(attachment.filename);
    
    if (documentType === "unknown") {
      console.log(`Skipping unsupported document type: ${attachment.filename}`);
      continue;
    }

    console.log(`Processing ${documentType} document: ${attachment.filename} (content length: ${attachment.content.length})`);
    
    try {
      // Generate a unique filename for storage
      const timestamp = new Date().getTime();
      const fileName = `invoice_${timestamp}_${attachment.filename}`;
      
      // Attempt to decode the base64 content to ensure it's valid
      let contentBuffer;
      try {
        contentBuffer = Buffer.from(attachment.content, 'base64');
        console.log(`Successfully decoded base64 content, byte length: ${contentBuffer.byteLength}`);
        
        if (contentBuffer.byteLength === 0) {
          console.error("Decoded content is empty");
          continue;
        }
      } catch (decodeError) {
        console.error(`Failed to decode base64 content for ${attachment.filename}:`, decodeError);
        continue;
      }
      
      // Upload the document to storage - FIX: Using the 'invoices' bucket without 'public/' subfolder
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('invoices')
        .upload(fileName, contentBuffer, {
          contentType: attachment.contentType,
          upsert: true
        });

      if (uploadError) {
        console.error("Failed to upload document:", uploadError);
        continue;
      }

      // Get the public URL
      const { data: urlData } = supabase.storage
        .from('invoices')
        .getPublicUrl(fileName);

      if (!urlData?.publicUrl) {
        console.error("Failed to get public URL for uploaded document");
        continue;
      }

      console.log(`Document uploaded successfully: ${urlData.publicUrl}`);

      // Extract text content based on document type
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

      if (extractedText) {
        console.log(`Successfully extracted text from ${attachment.filename}, text length: ${extractedText.length}`);
        documentContent = extractedText;
        processedAttachment = {
          ...attachment,
          url: urlData.publicUrl,
          filename: fileName
        };
        break; // Stop after first successful processing
      } else {
        console.warn(`No text extracted from ${attachment.filename}`);
      }
    } catch (error) {
      console.error(`Error processing document ${attachment.filename}:`, error);
    }
  }

  console.log(`Document processing complete. Success: ${!!processedAttachment}, URL: ${processedAttachment?.url || 'none'}`);
  return { documentContent, processedAttachment };
}
