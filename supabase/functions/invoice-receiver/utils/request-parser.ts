
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

  console.log("Processing multipart form data with content type:", contentType);
  let formData;
  
  try {
    formData = await request.formData();
  } catch (error) {
    console.error("Error getting form data:", error);
    throw new Error(`Failed to process form data: ${error.message}`);
  }
  
  const result: Record<string, any> = {};
  
  // Log all form data keys for debugging
  console.log("Form data keys:", Array.from(formData.keys()));
  
  // Process each form field
  for (const [key, value] of formData.entries()) {
    // Check if this might be a CloudMailin attachment
    if (key.startsWith('attachments[') || key === 'attachments[]') {
      console.log(`Found potential CloudMailin attachment with key: ${key}, type: ${typeof value}, is file: ${value instanceof File}`);
      
      if (!result.attachments) {
        result.attachments = [];
      }
      
      // CloudMailin sends attachments as files
      if (value instanceof File || value instanceof Blob) {
        // Get the file details
        const fileContent = value;
        const fileName = value instanceof File ? value.name : key.replace(/attachments\[\d*\]/, 'attachment');
        const contentType = value instanceof File ? value.type : 'application/octet-stream';
        
        console.log(`Processing file attachment: name=${fileName}, type=${contentType}, size=${fileContent.size}`);
        
        // Add to the attachments array
        result.attachments.push({
          filename: fileName,
          contentType: contentType,
          content: fileContent,
          size: fileContent.size
        });
      }
    } else if (key.startsWith('attachment_details[') || key === 'attachment_details[]') {
      // Process CloudMailin attachment details
      console.log(`Found attachment details with key: ${key}, value: ${value}`);
      
      // We'll process these after gathering all attachment files
      if (!result.attachment_details) {
        result.attachment_details = [];
      }
      
      // Try to parse the value as JSON if it's a string
      if (typeof value === 'string') {
        try {
          const parsedValue = JSON.parse(value);
          result.attachment_details.push(parsedValue);
          console.log(`Parsed attachment detail: ${JSON.stringify(parsedValue)}`);
        } catch {
          result.attachment_details.push(value);
          console.log(`Using attachment detail as string: ${value}`);
        }
      } else {
        result.attachment_details.push(value);
        console.log(`Using attachment detail as object: ${JSON.stringify(value)}`);
      }
    } else if (typeof value === "string") {
      try {
        // Try to parse JSON values
        result[key] = JSON.parse(value);
      } catch {
        // If not JSON, store as string
        result[key] = value;
      }
    } else {
      // Handle any other form fields
      result[key] = value;
    }
  }

  // Match up CloudMailin attachment details with the actual files
  if (result.attachments && result.attachment_details) {
    console.log("Matching attachment details with files");
    
    try {
      // CloudMailin specific format where attachment details are provided separately
      for (let i = 0; i < result.attachments.length; i++) {
        const attachment = result.attachments[i];
        const details = result.attachment_details[i];
        
        if (details) {
          if (typeof details === 'object') {
            // Copy relevant properties
            attachment.filename = details.filename || attachment.filename;
            attachment.contentType = details.content_type || details.contentType || attachment.contentType;
            console.log(`Updated attachment ${i} with details: filename=${attachment.filename}, contentType=${attachment.contentType}`);
          } else if (typeof details === 'string') {
            // Try to extract details from the string
            try {
              const detailsObj = JSON.parse(details);
              attachment.filename = detailsObj.filename || attachment.filename;
              attachment.contentType = detailsObj.content_type || detailsObj.contentType || attachment.contentType;
              console.log(`Updated attachment ${i} with parsed details: filename=${attachment.filename}, contentType=${attachment.contentType}`);
            } catch {
              // If parsing fails, just continue with what we have
              console.log(`Could not parse attachment details for attachment ${i}`);
            }
          }
        }
      }
    } catch (matchError) {
      console.error("Error matching attachment details:", matchError);
    }
    
    // Remove the attachment_details from the result to avoid confusion
    delete result.attachment_details;
  }

  console.log("Processed form data result:", Object.keys(result));
  if (result.attachments) {
    console.log(`Found ${result.attachments.length} attachments in form data`);
    // Log attachment summaries
    result.attachments.forEach((attachment: any, i: number) => {
      console.log(`Attachment ${i}: filename=${attachment.filename}, contentType=${attachment.contentType}, size=${attachment.size || 'N/A'}`);
    });
  }
  
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
  
  // Check if we already have processed attachments in the data
  if (Array.isArray(data.attachments)) {
    console.log(`Using ${data.attachments.length} attachments from data.attachments array`);
    attachments = data.attachments;
  } else if (Array.isArray(data.Attachments)) {
    console.log(`Using ${data.Attachments.length} attachments from data.Attachments array`);
    attachments = data.Attachments;
  } else if (data.attachment && !Array.isArray(data.attachment)) {
    // Some services might provide a single attachment object
    console.log("Using single attachment from data.attachment");
    attachments = [data.attachment];
  } else if (data.Attachment && !Array.isArray(data.Attachment)) {
    console.log("Using single attachment from data.Attachment");
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
