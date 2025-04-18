
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

  console.log(`Processing ${attachments.length} attachments`);
  
  for (const attachment of attachments) {
    console.log(`Examining attachment: ${attachment.filename} (${attachment.contentType})`);
    
    if (!attachment.content) {
      console.warn(`No content for attachment: ${attachment.filename}`);
      continue;
    }

    const documentType = getDocumentType(attachment.filename);
    
    if (documentType === "unknown") {
      console.log(`Skipping unsupported document type: ${attachment.filename}`);
      continue;
    }

    console.log(`Processing ${documentType} document: ${attachment.filename}`);
    
    try {
      // Generate a unique filename for storage
      const timestamp = new Date().getTime();
      const fileName = `invoice_${timestamp}_${attachment.filename}`;
      
      // Upload the document to storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('invoices')
        .upload(`public/${fileName}`, Buffer.from(attachment.content, 'base64'), {
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
        .getPublicUrl(`public/${fileName}`);

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
        console.log(`Successfully extracted text from ${attachment.filename}`);
        documentContent = extractedText;
        processedAttachment = {
          ...attachment,
          url: urlData.publicUrl,
          filename: fileName
        };
        break; // Stop after first successful processing
      }
    } catch (error) {
      console.error(`Error processing document ${attachment.filename}:`, error);
    }
  }

  return { documentContent, processedAttachment };
}
