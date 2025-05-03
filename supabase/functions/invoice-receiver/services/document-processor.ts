
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { Attachment } from "../services/invoice-types.ts";
import { ContentProcessorService } from "./content-processor-service.ts";
import { ContentExtractionService } from "./content-extraction-service.ts";

/**
 * Main entry point for processing document attachments
 * @param attachments Array of email attachments
 * @returns Processed document content and attachment
 */
export async function processDocument(attachments: Attachment[] = []) {
  const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  let documentContent = "";
  let processedAttachment: Attachment | null = null;

  if (!attachments || attachments.length === 0) {
    console.log("No attachments to process");
    return { documentContent: "", processedAttachment: null };
  }

  console.log(`Processing ${attachments.length} attachments:`, attachments.map(a => ({
    filename: a.filename || "unnamed",
    contentType: a.contentType || "unknown",
    hasContent: !!a.content,
    contentLength: a.content ? typeof a.content === 'string' ? a.content.length : 'binary' : 0
  })));

  // Sort attachments to prioritize PDFs and attachments with content
  const sortedAttachments = [...attachments].sort((a, b) => {
    const aIsPdf = a.contentType === 'application/pdf' || (a.filename && a.filename.toLowerCase().endsWith('.pdf'));
    const bIsPdf = b.contentType === 'application/pdf' || (b.filename && b.filename.toLowerCase().endsWith('.pdf'));
    if (aIsPdf && !bIsPdf) return -1;
    if (!aIsPdf && bIsPdf) return 1;
    if (a.content && !b.content) return -1;
    if (!a.content && b.content) return 1;
    return 0;
  });

  // Create services
  const contentProcessorService = new ContentProcessorService(supabaseUrl, supabaseServiceKey);
  const contentExtractionService = new ContentExtractionService();
  
  // Process each attachment in order until we find a valid document
  for (const attachment of sortedAttachments) {
    const result = await contentProcessorService.processAttachment(attachment);
    
    if (result.processedAttachment) {
      documentContent = result.documentContent;
      processedAttachment = result.processedAttachment;
      
      // Stop after finding a PDF document
      const isPdf = attachment.contentType === 'application/pdf' || 
                    (attachment.filename && attachment.filename.toLowerCase().endsWith('.pdf'));
      if (isPdf) {
        console.log(`PDF document processed successfully: ${attachment.filename}`);
        break;
      }
    } else if (result.error) {
      console.error(`Error processing attachment: ${result.error}`);
    }
  }

  // If no valid document was processed, use the first attachment as fallback
  if (!processedAttachment && sortedAttachments.length > 0) {
    console.log("No documents processed, using first attachment as fallback");
    const fallbackResult = await contentProcessorService.processFallbackAttachment(sortedAttachments[0]);
    if (fallbackResult.processedAttachment) {
      processedAttachment = fallbackResult.processedAttachment;
    }
  }

  console.log(`Document processing complete for ${processedAttachment?.filename || 'none'}`, {
    success: !!processedAttachment,
    url: processedAttachment?.url || 'none'
  });
  
  return { documentContent, processedAttachment };
}
