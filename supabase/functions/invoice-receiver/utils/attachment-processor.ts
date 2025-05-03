
/**
 * Extract and normalize attachments from different email service formats
 */
export function processAttachments(data: any): any[] {
  // Safely check if data exists
  if (!data) return [];
  
  // Initialize with empty array as fallback
  let attachments: any[] = [];
  
  // Handle different attachment field names based on email service providers
  if (Array.isArray(data.attachments)) {
    attachments = data.attachments;
  } else if (Array.isArray(data.Attachments)) {
    attachments = data.Attachments;
  } else if (data.attachment && !Array.isArray(data.attachment)) {
    // Some services might provide a single attachment object
    attachments = [data.attachment];
  } else if (data.Attachment && !Array.isArray(data.Attachment)) {
    attachments = [data.Attachment];
  }
  
  // Check for CloudMailin specific formats
  if (attachments.length === 0 && data.attachments && typeof data.attachments === 'string') {
    try {
      const parsedAttachments = JSON.parse(data.attachments);
      if (Array.isArray(parsedAttachments) && parsedAttachments.length > 0) {
        console.log(`Found ${parsedAttachments.length} attachments in parsed data.attachments string`);
        attachments = parsedAttachments;
      }
    } catch (e) {
      console.log("Could not parse attachments string as JSON");
    }
  }
  
  // Also check for Sendgrid style attachments
  if (attachments.length === 0 && data.email && data.email.attachments) {
    console.log(`Found ${data.email.attachments.length} attachments in data.email.attachments`);
    attachments = data.email.attachments;
  }
  
  // Attempt to find raw attachments in any other key that might contain them
  if (attachments.length === 0) {
    for (const key in data) {
      const value = data[key];
      if (Array.isArray(value) && value.length > 0 && 
          value[0] && (value[0].filename || value[0].content || value[0].contentType)) {
        console.log(`Found potential attachments in data.${key}`);
        attachments = value;
        break;
      }
    }
  }
  
  console.log(`Processing ${attachments.length} attachments`);
  return attachments;
}
