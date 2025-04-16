
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
  
  // Always store the full HTML content to ensure we can display the complete message
  lead.html_content = content;
  
  if (additionalInfo.notes) {
    lead.additional_requirements = additionalInfo.notes;
  }
  
  // Check if we've inadvertently captured 'scope of services' as a name
  // This guards against issues where RFP section headers are misidentified as names
  if (lead.name && (
    lead.name.toLowerCase().includes("scope of services") || 
    lead.name.toLowerCase().includes("rfp") ||
    lead.name.toLowerCase().includes("request for proposal")
  )) {
    console.log("Detected scope of services text in name, removing");
    lead.name = "";
    lead.first_name = "";
    lead.last_name = "";
  }
  
  return lead;
}
