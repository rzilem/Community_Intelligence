
import { 
  extractTextFromPdf, 
  extractTextFromDocx, 
  extractTextFromDoc, 
  getDocumentType 
} from "../utils/document-parser.ts";

export async function processDocument(attachments: any[] = []) {
  let documentContent = "";
  let processedAttachment = null;

  if (attachments && attachments.length > 0) {
    console.log(`Found ${attachments.length} attachments to process`);
    
    for (const attachment of attachments) {
      console.log(`Processing attachment: ${attachment.filename}, type: ${attachment.contentType}`);
      
      const documentType = getDocumentType(attachment.filename);
      
      if (documentType !== "unknown") {
        console.log(`Found document attachment: ${attachment.filename}, type: ${documentType}`);
        
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
          break;
        }
      }
    }
  }

  return { documentContent, processedAttachment };
}
