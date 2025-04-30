
/**
 * Functions for parsing and normalizing email webhook data
 */

// Extract tracking number from email subject or body
export function extractTrackingNumber(subject?: string, body?: string): string | null {
  // Default tracking number format
  let trackingNumberRegex = /\b(HOR-\d{6})\b/i;
  
  // Try to find tracking number in subject
  if (subject) {
    const subjectMatch = subject.match(trackingNumberRegex);
    if (subjectMatch && subjectMatch[1]) {
      return subjectMatch[1];
    }
  }
  
  // Try to find tracking number in body
  if (body) {
    const bodyMatch = body.match(trackingNumberRegex);
    if (bodyMatch && bodyMatch[1]) {
      return bodyMatch[1];
    }
  }
  
  // Generate a new tracking number if none found
  return `HOR-${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`;
}

// Process raw multipart form data using native FormData API
export async function processMultipartFormData(request: Request): Promise<any> {
  const contentType = request.headers.get("content-type") || "";
  console.log("Processing request with content-type:", contentType);
  
  // If not multipart form data, try json parsing
  if (!contentType.includes("multipart/form-data")) {
    try {
      // We will handle JSON parsing in the main function
      throw new Error(`Not a multipart form: ${contentType}`);
    } catch (error) {
      console.error("Not a multipart form data request:", error);
      throw error;
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
  
  console.log("Form data entries:", [...formData.keys()]);
  
  const result: Record<string, any> = {};
  
  // Process each form field
  for (const [key, value] of formData.entries()) {
    console.log(`Processing form field: ${key}, type: ${typeof value}`);
    
    // CloudMailin specific handling for attachments array
    if (key === 'attachments' && typeof value === "string") {
      try {
        result[key] = JSON.parse(value);
        console.log(`Parsed attachments as JSON array with ${result[key].length} items`);
      } catch {
        console.log('Failed to parse attachments as JSON, storing as string');
        result[key] = value;
      }
      continue;
    }
    
    if (typeof value === "string") {
      try {
        // Try to parse JSON values
        result[key] = JSON.parse(value);
        console.log(`Parsed ${key} as JSON object`);
      } catch {
        // If not JSON, store as string
        result[key] = value;
        console.log(`Stored ${key} as string, length: ${value.length}`);
      }
    } else {
      // Handle file data if needed
      console.log(`Field ${key} is a file or binary data`);
      result[key] = value;
    }
  }

  if (Object.keys(result).length === 0) {
    throw new Error("No form fields found after processing");
  }
  
  console.log("Processed form data keys:", Object.keys(result));
  return result;
}

// Function to extract the most important fields from different email webhook formats
export function normalizeEmailData(data: any): any {
  console.log("Normalizing email data from format:", 
    typeof data === 'object' ? (Array.isArray(data) ? 'array' : 'object') : typeof data);
  
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
  
  const normalizedData: Record<string, any> = {};
  
  // CloudMailin specific format handling - Multipart Normalized format
  if (data.headers && typeof data.headers === 'object') {
    console.log("Detected CloudMailin format with headers object");
    normalizedData.subject = data.headers.Subject || data.headers.subject || "";
    normalizedData.from = data.headers.From || data.headers.from || "";
    normalizedData.to = data.headers.To || data.headers.to || "";
    
    // CloudMailin specific structure for Multipart Normalized format
    if (data.plain !== undefined) normalizedData.text = data.plain;
    if (data.html !== undefined) normalizedData.html = data.html;
    
    // CloudMailin also passes envelope data sometimes
    if (data.envelope && typeof data.envelope === 'object') {
      console.log("Found envelope data in CloudMailin format");
      if (!normalizedData.from) normalizedData.from = data.envelope.from || "";
      if (!normalizedData.to) normalizedData.to = data.envelope.to || "";
    }
  }
  
  // Handle different field names for common email properties
  normalizedData.from = normalizedData.from || data.from || data.From || data.sender || data.Sender || "";
  normalizedData.to = normalizedData.to || data.to || data.To || data.recipient || data.Recipient || "";
  normalizedData.subject = normalizedData.subject || data.subject || data.Subject || "";
  
  // Content fields
  normalizedData.html = normalizedData.html || data.html || data.Html || data.body_html || data.body || data.Body || "";
  normalizedData.text = normalizedData.text || data.text || data.Text || data.body_plain || data.plain || data.Plain || "";
  
  // Process attachments from various email services
  normalizedData.attachments = processAttachments(data);
  
  // Create a tracking number from email ID or message ID
  normalizedData.tracking_number = data.message_id || data.messageId || data.id || 
    (data.envelope && data.envelope.messageId) || `email-${Date.now()}`;
  
  // Add raw email data for debugging
  normalizedData.raw_email = data;
  
  console.log("Normalized email fields:", 
    `from: ${normalizedData.from?.substring(0, 30) || 'missing'}, ` +
    `to: ${normalizedData.to?.substring(0, 30) || 'missing'}, ` + 
    `subject: ${normalizedData.subject || 'missing'}, ` +
    `html: ${normalizedData.html ? 'present' : 'missing'} (${normalizedData.html?.length || 0} chars), ` +
    `text: ${normalizedData.text ? 'present' : 'missing'} (${normalizedData.text?.length || 0} chars), ` +
    `attachments: ${normalizedData.attachments?.length || 0}`
  );
  
  return normalizedData;
}

// Extract and normalize attachments from different email service formats
function processAttachments(data: any): any[] {
  // Safely check if data exists
  if (!data) return [];
  
  // Initialize with empty array as fallback
  let attachments: any[] = [];
  
  // Handle different attachment field names based on email service providers
  if (Array.isArray(data.attachments)) {
    attachments = data.attachments;
    console.log(`Found ${attachments.length} attachments in data.attachments array`);
  } else if (Array.isArray(data.Attachments)) {
    attachments = data.Attachments;
    console.log(`Found ${attachments.length} attachments in data.Attachments array`);
  } else if (data.attachment && !Array.isArray(data.attachment)) {
    // Some services might provide a single attachment object
    attachments = [data.attachment];
    console.log("Found single attachment object in data.attachment");
  } else if (data.Attachment && !Array.isArray(data.Attachment)) {
    attachments = [data.Attachment];
    console.log("Found single attachment object in data.Attachment");
  }
  
  // Try to parse attachments from CloudMailin's normalized format
  // where they might be in a string format that needs to be parsed
  if (!attachments.length && typeof data.attachments === 'string') {
    try {
      const parsedAttachments = JSON.parse(data.attachments);
      if (Array.isArray(parsedAttachments)) {
        attachments = parsedAttachments;
        console.log(`Parsed ${attachments.length} attachments from string`);
      }
    } catch (e) {
      console.log("Failed to parse attachments string as JSON");
    }
  }
  
  // Standardize attachment object structure
  return attachments.map(attachment => {
    if (!attachment) return null;
    
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
    
    console.log(`Processed attachment: ${normalized.filename} (${normalized.contentType}, ${normalized.size} bytes)`);
    
    return normalized;
  }).filter(Boolean) as any[];
}
