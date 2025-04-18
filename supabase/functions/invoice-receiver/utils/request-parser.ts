
// This file contains utility functions for parsing requests from email providers like CloudMailin

/**
 * Process multipart/form-data requests and extract relevant fields
 */
export async function processMultipartFormData(request: Request): Promise<any> {
  const contentType = request.headers.get("content-type");
  
  // If not multipart form data, try json parsing
  if (!contentType || !contentType.includes("multipart/form-data")) {
    try {
      return await request.json();
    } catch (error) {
      console.error("Error parsing JSON request:", error);
      throw new Error(`Not a multipart form or valid JSON: ${contentType}`);
    }
  }

  console.log("Processing multipart form data");
  let formData;
  
  try {
    formData = await request.formData();
  } catch (error) {
    console.error("Error getting form data:", error);
    throw new Error(`Failed to process form data: ${error.message}`);
  }
  
  const result: Record<string, any> = {};
  
  // Process each form field
  for (const [key, value] of formData.entries()) {
    if (typeof value === "string") {
      try {
        // Try to parse JSON values
        result[key] = JSON.parse(value);
      } catch {
        // If not JSON, store as string
        result[key] = value;
      }
    } else {
      // Handle file data if needed
      result[key] = value;
    }
  }

  // CloudMailin specific handling for attachments
  // Look for attachment_details and attachments fields which are specific to CloudMailin
  if (formData.has('attachment_details[]')) {
    // Check for CloudMailin attachment format
    console.log("Found CloudMailin attachment_details[] field");
    const attachmentDetails = [];
    
    // Get all attachment details entries
    const attachmentKeys = Array.from(formData.keys()).filter(key => 
      key.startsWith('attachment_details[') || key === 'attachment_details[]'
    );
    
    // Get all attachment file entries
    const attachmentFiles = Array.from(formData.keys()).filter(key => 
      key.startsWith('attachments[') || key === 'attachments[]'
    );
    
    console.log(`Found ${attachmentKeys.length} attachment detail entries and ${attachmentFiles.length} attachment files`);
    
    // Process all attachment files
    for (let i = 0; i < attachmentFiles.length; i++) {
      const fileKey = attachmentFiles[i];
      const fileContent = formData.get(fileKey);
      
      // Find corresponding details for this file
      const detailPrefix = fileKey.replace('attachments', 'attachment_details');
      const detailKeys = Array.from(formData.keys()).filter(key => 
        key.startsWith(detailPrefix) || 
        (detailPrefix === 'attachment_details[]' && key === 'attachment_details[]')
      );
      
      // Extract attachment details
      const details: Record<string, any> = {};
      for (const detailKey of detailKeys) {
        const propMatch = detailKey.match(/\[(\d+)\]\[([^\]]+)\]/);
        if (propMatch) {
          const propName = propMatch[2];
          details[propName] = formData.get(detailKey);
        } else {
          // Default to single attachment case
          const simpleMatch = detailKey.match(/\[([^\]]+)\]/);
          if (simpleMatch) {
            const propName = simpleMatch[1];
            details[propName] = formData.get(detailKey);
          }
        }
      }
      
      // Create attachment object
      attachmentDetails.push({
        filename: details.filename || `attachment_${i}.bin`,
        contentType: details.content_type || details.contentType || 'application/octet-stream',
        content: fileContent,
        size: fileContent instanceof Blob ? fileContent.size : 0
      });
    }
    
    // Add processed attachments to result
    if (attachmentDetails.length > 0) {
      console.log(`Processed ${attachmentDetails.length} CloudMailin attachments`);
      result.attachments = attachmentDetails;
    }
  }

  console.log("Processed form data:", Object.keys(result));
  return result;
}

/**
 * Normalize email data from different providers into a standard format
 */
export function normalizeEmailData(data: any): any {
  const normalizedData: Record<string, any> = {};
  
  // Handle cases where data might be null, undefined, or not an object
  if (!data || typeof data !== 'object') {
    console.error("Invalid email data format:", data);
    return {
      from: "",
      to: "",
      subject: "",
      html: "",
      text: "",
      tracking_number: `email-${Date.now()}`
    };
  }
  
  // CloudMailin specific format handling
  if (data.headers && typeof data.headers === 'object') {
    console.log("Detected CloudMailin format with headers object");
    normalizedData.subject = data.headers.Subject || data.headers.subject || "";
    normalizedData.from = data.headers.From || data.headers.from || "";
    normalizedData.to = data.headers.To || data.headers.to || "";
    
    // CloudMailin specific structure
    if (data.plain !== undefined) normalizedData.text = data.plain;
    if (data.html !== undefined) normalizedData.html = data.html;
  }
  
  // Handle different field names for common email properties
  normalizedData.from = normalizedData.from || data.from || data.From || data.sender || data.Sender || "";
  normalizedData.to = normalizedData.to || data.to || data.To || data.recipient || data.Recipient || "";
  normalizedData.subject = normalizedData.subject || data.subject || data.Subject || "";
  normalizedData.html = normalizedData.html || data.html || data.Html || data.body || data.Body || "";
  normalizedData.text = normalizedData.text || data.text || data.Text || data.plain || data.Plain || "";
  
  // Process attachments from various email services
  normalizedData.attachments = processAttachments(data);
  
  // Create a tracking number
  normalizedData.tracking_number = data.message_id || data.messageId || data.id || 
    data.envelope?.messageId || `email-${Date.now()}`;
  
  // Add original data for reference in case we need to debug
  normalizedData.original = data;
  
  return normalizedData;
}

/**
 * Process attachments from different email service formats
 */
function processAttachments(data: any): any[] {
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
  
  // Standardize attachment object structure
  return attachments.map(attachment => {
    if (!attachment) return { filename: "unknown", contentType: "application/octet-stream", content: "", size: 0 };
    
    const normalized: Record<string, any> = {};
    
    // Extract filename with fallbacks
    normalized.filename = attachment.filename || attachment.name || attachment.fileName || 
                          attachment.Filename || attachment.Name || "unknown";
    
    // Extract content type with fallbacks
    normalized.contentType = attachment.contentType || attachment.content_type || 
                             attachment.type || attachment.Type || attachment.mime || 
                             "application/octet-stream";
    
    // Extract content with fallbacks (might be base64 encoded)
    normalized.content = attachment.content || attachment.data || attachment.Content || 
                         attachment.Data || attachment.body || attachment.Body || "";
                         
    // Some services might provide the size
    normalized.size = attachment.size || attachment.Size || 0;
    
    return normalized;
  });
}
