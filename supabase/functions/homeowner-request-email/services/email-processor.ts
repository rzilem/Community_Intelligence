
/**
 * Service to process email data and extract homeowner request information
 */

export async function processEmailData(emailData: any) {
  console.log("Processing email for homeowner request extraction");
  console.log("Email data received:", JSON.stringify({
    from: emailData.from,
    to: emailData.to,
    subject: emailData.subject,
    has_html: !!emailData.html,
    has_text: !!emailData.text,
    attachments: emailData.attachments?.length || 0
  }, null, 2));
  
  // Extract the data we need to create a request
  const requestData: Record<string, any> = {
    title: emailData.subject || "Email Request",
    status: "open",
    priority: determinePriority(emailData.subject),
    type: determineRequestType(emailData.subject, emailData.text || "", emailData.html || ""),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    tracking_number: emailData.tracking_number || `REQ-${Date.now()}`,
  };
  
  // Extract email content
  if (emailData.html) {
    // Store the full HTML content
    requestData.html_content = emailData.html;
    
    // Extract the text content for the description, properly cleaning it
    let textContent = cleanHtmlContent(emailData.html);
    requestData.description = textContent.substring(0, 500);
  } else if (emailData.text) {
    // If only text is available, use it directly
    requestData.description = emailData.text.substring(0, 500);
  } else {
    requestData.description = "Request submitted via email. No content provided.";
  }
  
  // Extract sender information for possible resident matching
  const senderEmail = extractSenderEmail(emailData.from || "");
  if (senderEmail) {
    requestData.sender_email = senderEmail;
    console.log("Extracted sender email:", senderEmail);
  }
  
  // IMPORTANT: Always set the default association ID
  // This ensures all requests are visible in the queue
  requestData.association_id = "85bdb4ea-4288-414d-8f17-83b4a33725b8"; // Default to Reeceville COA
  console.log("Using association ID:", requestData.association_id);
  
  // Handle attachments if present
  if (emailData.attachments && emailData.attachments.length > 0) {
    console.log(`Processing ${emailData.attachments.length} attachments`);
    // Store attachment metadata in the request
    requestData.attachment_data = emailData.attachments.map((attachment: any) => ({
      filename: attachment.filename,
      contentType: attachment.contentType,
      size: attachment.size
    }));
    
    // Include attachment info in description
    const attachmentInfo = emailData.attachments
      .map((a: any) => `${a.filename} (${a.contentType})`)
      .join(", ");
    
    requestData.description += `\n\nAttachments: ${attachmentInfo}`;
  }
  
  console.log("Extracted request data:", JSON.stringify(requestData, null, 2));
  return requestData;
}

/**
 * Properly cleans HTML content, handling HTML entities and removing unwanted elements
 */
function cleanHtmlContent(htmlContent: string): string {
  // First remove common email client added elements that we don't want
  let cleaned = htmlContent
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')  // Remove style tags and content
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '') // Remove script tags and content
    .replace(/<head[^>]*>[\s\S]*?<\/head>/gi, '')     // Remove head section
    .replace(/<img[^>]*>/gi, '[Image]')               // Replace images with placeholder
    .replace(/<hr[^>]*>/gi, '---')                    // Replace horizontal rules with dashes
    .replace(/<br[^>]*>/gi, '\n')                     // Replace <br> with newlines
    .replace(/<div[^>]*>/gi, '')                      // Remove div opening tags
    .replace(/<\/div>/gi, '\n')                       // Replace closing divs with newlines
    .replace(/<p[^>]*>/gi, '')                        // Remove p opening tags
    .replace(/<\/p>/gi, '\n\n')                       // Replace closing p tags with double newlines
    .replace(/<[^>]*>/g, ' ')                         // Remove all other tags
    .replace(/&nbsp;/g, ' ')                          // Replace non-breaking spaces
    .replace(/&amp;/g, '&')                           // Replace &amp; with &
    .replace(/&lt;/g, '<')                            // Replace &lt; with <
    .replace(/&gt;/g, '>')                            // Replace &gt; with >
    .replace(/&quot;/g, '"')                          // Replace &quot; with "
    .replace(/&#39;/g, "'")                           // Replace &#39; with '
    .replace(/\n{3,}/g, '\n\n')                       // Replace 3+ consecutive newlines with 2
    .replace(/\s{2,}/g, ' ')                          // Replace 2+ consecutive spaces with 1
    .trim();                                          // Trim whitespace
  
  return cleaned;
}

function determinePriority(subject: string): string {
  if (!subject) return "medium";
  
  subject = subject.toLowerCase();
  
  if (subject.includes("urgent") || 
      subject.includes("emergency") || 
      subject.includes("immediate")) {
    return "urgent";
  } else if (subject.includes("important") || 
             subject.includes("high priority")) {
    return "high";
  } else if (subject.includes("low priority") || 
             subject.includes("minor")) {
    return "low";
  }
  
  return "medium";
}

function determineRequestType(subject: string, text: string, html: string): string {
  const combinedText = `${subject || ""} ${text || ""} ${html || ""}`.toLowerCase();
  
  if (combinedText.includes("maintenance") || 
      combinedText.includes("repair") || 
      combinedText.includes("broken") ||
      combinedText.includes("fix")) {
    return "maintenance";
  } else if (combinedText.includes("billing") || 
             combinedText.includes("payment") || 
             combinedText.includes("invoice") ||
             combinedText.includes("fee")) {
    return "billing";
  } else if (combinedText.includes("compliance") || 
             combinedText.includes("violation") || 
             combinedText.includes("rule") ||
             combinedText.includes("regulation")) {
    return "compliance";
  } else if (combinedText.includes("amenity") || 
             combinedText.includes("pool") || 
             combinedText.includes("gym") ||
             combinedText.includes("common area")) {
    return "amenity";
  }
  
  return "general";
}

function extractSenderEmail(fromHeader: string): string | null {
  if (!fromHeader) return null;
  
  // Simple regex to extract email from From header
  const emailMatch = fromHeader.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/i);
  return emailMatch ? emailMatch[1] : null;
}

function extractAssociationId(emailData: any): string | null {
  // Always return a default association ID to ensure requests appear in the queue
  return "85bdb4ea-4288-414d-8f17-83b4a33725b8"; // Reeceville COA
}
