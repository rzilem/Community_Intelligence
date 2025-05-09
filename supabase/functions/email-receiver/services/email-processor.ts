
import { extractContactInformation } from "./extractors/contact-extractor.ts";
import { extractAssociationInformation } from "./extractors/association-extractor.ts";
import { extractLocationInformation } from "./extractors/location-extractor.ts";
import { extractAdditionalInformation } from "./extractors/additional-info-extractor.ts";
import { analyzeLeadWithAI } from "./ai-analyzer.ts";

export async function processEmail(emailData: any): Promise<any> {
  console.log("Processing email data for lead");
  
  // Extract basic information from email
  const from = emailData.from || emailData.From || emailData.sender || emailData.Sender || "";
  const subject = emailData.subject || emailData.Subject || "";
  const rawHtmlContent = emailData.html || emailData.Html || emailData.body || emailData.Body || "";
  const rawTextContent = emailData.text || emailData.Text || emailData.plain || emailData.Plain || "";
  
  // Prepare the lead object with default values
  const lead: Record<string, any> = {
    source: "Email",
    status: "new",
    html_content: rawHtmlContent,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  // Get the best content for extraction
  const content = rawTextContent || 
    (rawHtmlContent ? rawHtmlContent.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ') : '') || 
    subject;
  
  // Use traditional extractors first
  const contactInfo = extractContactInformation(content, from);
  const associationInfo = extractAssociationInformation(content);
  const locationInfo = extractLocationInformation(content);
  const additionalInfo = extractAdditionalInformation(content);
  
  Object.assign(lead, contactInfo, associationInfo, locationInfo, additionalInfo);
  
  // Use AI to enhance the lead data
  try {
    console.log("Starting AI analysis of lead content");
    const aiExtractedData = await analyzeLeadWithAI(content, subject, from);
    
    if (aiExtractedData) {
      console.log("AI analysis successful, enhancing lead data");
      
      // Use AI data to fill in missing fields or enhance existing ones
      Object.entries(aiExtractedData).forEach(([key, value]) => {
        // Skip internal fields starting with _
        if (key.startsWith('_')) return;
        
        // Only replace fields that are empty or where AI has higher confidence
        if (!lead[key] || 
            (typeof value === 'string' && value.length > (lead[key]?.length || 0))) {
          lead[key] = value;
        }
      });
      
      // Store AI confidence data for future reference
      if (aiExtractedData._aiConfidence) {
        lead._aiConfidence = aiExtractedData._aiConfidence;
      }
    }
  } catch (aiError) {
    console.error("AI analysis error:", aiError);
    // Continue with traditional extraction only, don't fail the process
  }
  
  // Set the name if not already set
  if (!lead.name && (lead.first_name || lead.last_name)) {
    lead.name = `${lead.first_name || ''} ${lead.last_name || ''}`.trim();
  }
  
  // Generate a tracking number
  lead.tracking_number = `LEAD-${Date.now().toString().slice(-6)}`;
  
  // Ensure we have all required fields
  if (!lead.email) {
    // Try to extract email from the 'from' field as a last resort
    const emailMatch = from.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    if (emailMatch) {
      lead.email = emailMatch[0];
    } else {
      lead.email = "unknown@example.com";
    }
  }
  
  if (!lead.name) {
    lead.name = lead.email.split('@')[0] || "Unknown Contact";
  }
  
  console.log("Final processed lead data:", lead);
  return lead;
}
