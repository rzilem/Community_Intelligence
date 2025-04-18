
import { 
  extractTextFromPdf, 
  extractTextFromDocx, 
  extractTextFromDoc, 
  getDocumentType 
} from "../utils/document-parser.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

// Initialize Supabase client with service role key for storage access
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function processDocument(attachments: any[] = []) {
  let documentContent = "";
  let processedAttachment = null;

  if (!attachments || attachments.length === 0) {
    console.log("No attachments to process");
    return { documentContent: "", processedAttachment: null };
  }

  console.log(`Processing ${attachments.length} attachments:`, 
    attachments.map(a => ({ 
      filename: a.filename, 
      contentType: a.contentType,
      hasContent: !!a.content,
      contentLength: a.content ? a.content.length : 0
    }))
  );
  
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
      const safeFilename = attachment.filename.replace(/[^a-zA-Z0-9.-]/g, '_');
      const fileName = `invoice_${timestamp}_${safeFilename}`;
      
      // Attempt to decode the base64 content to ensure it's valid
      let contentBuffer;
      try {
        // Check if content is already Base64-encoded
        const isBase64 = /^([A-Za-z0-9+/]{4})*([A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{2}==)?$/.test(attachment.content.trim());
        
        if (isBase64) {
          console.log(`Content appears to be Base64 encoded, decoding now`);
          contentBuffer = new Uint8Array(atob(attachment.content).split('').map(c => c.charCodeAt(0)));
        } else {
          console.log(`Content does not appear to be Base64 encoded, encoding it first`);
          contentBuffer = new TextEncoder().encode(attachment.content);
        }
        
        console.log(`Successfully processed content, byte length: ${contentBuffer.byteLength}`);
        
        if (contentBuffer.byteLength === 0) {
          console.error("Processed content is empty");
          continue;
        }
      } catch (decodeError) {
        console.error(`Failed to process content for ${attachment.filename}:`, decodeError);
        // Try direct upload as a fallback
        console.log("Attempting direct upload without processing");
        contentBuffer = new TextEncoder().encode(attachment.content);
      }
      
      // Attempt to upload directly to the bucket without 'public/' prefix
      const uploadResult = await supabase.storage
        .from('invoices')
        .upload(fileName, contentBuffer, {
          contentType: attachment.contentType || 'application/octet-stream',
          upsert: true
        });

      if (uploadResult.error) {
        console.error("Failed to upload document:", uploadResult.error);
        
        // Try alternative method if first attempt failed
        try {
          console.log("Attempting alternative upload method...");
          const altBuffer = new TextEncoder().encode(attachment.content);
          const altResult = await supabase.storage
            .from('invoices')
            .upload(fileName, altBuffer, {
              contentType: 'application/octet-stream',
              upsert: true
            });
            
          if (altResult.error) {
            console.error("Alternative upload also failed:", altResult.error);
            continue;
          } else {
            console.log("Alternative upload succeeded!");
            uploadResult.data = altResult.data;
          }
        } catch (altError) {
          console.error("Error in alternative upload:", altError);
          continue;
        }
      }

      // Get the public URL after successful upload
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
      try {
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
      } catch (extractError) {
        console.error(`Error extracting text: ${extractError.message}`);
        // Even if text extraction fails, we still have the document
      }

      console.log(`Text extraction ${extractedText ? 'successful' : 'failed'}, length: ${extractedText?.length || 0}`);
      documentContent = extractedText || "";
      processedAttachment = {
        ...attachment,
        url: urlData.publicUrl,
        filename: fileName
      };
      break; // Stop after first successful processing
    } catch (error) {
      console.error(`Error processing document ${attachment.filename}:`, error);
    }
  }

  console.log(`Document processing complete. Success: ${!!processedAttachment}, URL: ${processedAttachment?.url || 'none'}`);
  return { documentContent, processedAttachment };
}
