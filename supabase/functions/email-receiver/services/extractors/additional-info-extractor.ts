
import { extractAdditionalInfo } from "../../utils/additional-extractors.ts";

/**
 * Extract additional information/notes from the email content
 */
export function extractAdditionalInformation(content: string) {
  console.log("Extracting additional information");
  const lead: Record<string, any> = {};
  
  // Extract additional information/notes
  const additionalInfo = extractAdditionalInfo(content);
  console.log("Additional info extracted:", additionalInfo);
  
  if (additionalInfo.notes) {
    lead.additional_requirements = additionalInfo.notes;
    // Store the full HTML content to ensure we can display the complete message
    lead.html_content = content;
  }
  
  return lead;
}
