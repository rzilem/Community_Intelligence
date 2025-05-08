
import { LoggingService } from "./logging-service.ts";

export async function processAttachments(normalizedEmailData: any, requestId: string, loggingService: LoggingService, supabase: any) {
  let pdfUrl = null;
  
  try {
    if (normalizedEmailData.attachments && normalizedEmailData.attachments.length > 0) {
      await loggingService.logInfo(requestId, "Processing attachments", { 
        count: normalizedEmailData.attachments.length 
      });
      
      // Find the first PDF or Word document attachment
      const attachment = normalizedEmailData.attachments.find((att: any) => 
        (att.contentType && att.contentType.includes('pdf')) || 
        (att.contentType && att.contentType.includes('word')) || 
        (att.contentType && att.contentType.includes('doc'))
      );
      
      if (attachment) {
        await loggingService.logInfo(requestId, "Found document attachment", {
          filename: attachment.filename,
          contentType: attachment.contentType
        });
        
        // Generate a unique filename
        const fileExt = attachment.filename.substring(attachment.filename.lastIndexOf('.'));
        const fileName = `invoice_${Date.now()}${fileExt}`;
        
        try {
          // Upload to storage
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('invoices')
            .upload(fileName, attachment.content, {
              contentType: attachment.contentType,
              upsert: true
            });
            
          if (uploadError) {
            await loggingService.logError(requestId, "Error uploading attachment", uploadError);
          } else {
            // Get public URL
            const { data: urlData } = supabase.storage
              .from('invoices')
              .getPublicUrl(fileName);
              
            pdfUrl = urlData.publicUrl;
            await loggingService.logInfo(requestId, "Attachment uploaded successfully", { url: pdfUrl });
          }
        } catch (storageError) {
          await loggingService.logError(requestId, "Storage error", storageError);
        }
      } else {
        await loggingService.logInfo(requestId, "No PDF/Word attachments found in email");
      }
    } else {
      await loggingService.logInfo(requestId, "No attachments to process");
    }
  } catch (error: any) {
    await loggingService.logError(requestId, "Error processing attachments", error);
  }
  
  return { pdfUrl };
}
