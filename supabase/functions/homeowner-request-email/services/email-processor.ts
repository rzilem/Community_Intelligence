
/**
 * Service to process email data and extract homeowner request information
 */

export async function processEmailData(emailData: any) {
  console.log("Processing email for homeowner request extraction");
  
  // Extract the data we need to create a request
  const requestData: Record<string, any> = {
    title: emailData.subject || "Email Request",
    status: "open",
    priority: determinePriority(emailData.subject),
    type: determineRequestType(emailData.subject, emailData.text, emailData.html),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    tracking_number: emailData.tracking_number || `REQ-${Date.now()}`,
  };
  
  // Extract email content
  if (emailData.html) {
    requestData.html_content = emailData.html;
    
    // Extract the first 500 characters of HTML content for description
    // Strip HTML tags for a clean description
    let textContent = emailData.html
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s{2,}/g, ' ')
      .trim();
      
    requestData.description = textContent.substring(0, 500);
  } else if (emailData.text) {
    requestData.description = emailData.text.substring(0, 500);
  } else {
    requestData.description = "Request submitted via email. No content provided.";
  }
  
  // Attempt to extract an association ID if present in the subject or email
  requestData.association_id = extractAssociationId(emailData);
  
  // Extract sender information for possible resident matching
  const senderEmail = extractSenderEmail(emailData.from);
  if (senderEmail) {
    requestData.sender_email = senderEmail;
    
    // We could look up the resident based on email
    // This would be done via a database query in a production system
    // requestData.resident_id = await findResidentByEmail(senderEmail);
  }
  
  // Handle attachments if present
  if (emailData.attachments && emailData.attachments.length > 0) {
    console.log(`Processing ${emailData.attachments.length} attachments`);
    // Store attachment metadata in the request
    requestData.attachment_data = emailData.attachments.map((attachment: any) => ({
      filename: attachment.filename,
      contentType: attachment.contentType,
      size: attachment.size
    }));
  }
  
  console.log("Extracted request data:", requestData);
  return requestData;
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
  // This would normally extract the association ID from the email data
  // For now, we'll return null and let the application assign it
  return null;
}
