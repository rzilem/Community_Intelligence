
// Process raw multipart form data using native FormData API
export async function processMultipartFormData(request: Request): Promise<any> {
  const contentType = request.headers.get("content-type");
  
  // If not multipart form data, try json parsing
  if (!contentType || !contentType.includes("multipart/form-data")) {
    try {
      const jsonData = await request.json();
      console.log("Parsed request as JSON data:", JSON.stringify(jsonData, null, 2));
      return jsonData;
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

  console.log("Processed form data keys:", Object.keys(result));
  return result;
}

// Function to extract the most important fields from different email webhook formats
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
  
  console.log("Normalizing email data from structure:", Object.keys(data));
  
  // Deep inspection of data to find attachments
  if (data.envelope && typeof data.envelope === 'string') {
    try {
      const parsedEnvelope = JSON.parse(data.envelope);
      if (parsedEnvelope) {
        console.log("Found and parsed envelope data");
        data.parsedEnvelope = parsedEnvelope;
      }
    } catch (e) {
      console.log("Could not parse envelope as JSON");
    }
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
  
  // Add original data for reference but remove large content to avoid log flooding
  const originalCopy = { ...data };
  if (originalCopy.html) originalCopy.html = `${originalCopy.html.substring(0, 100)}... (truncated)`;
  if (originalCopy.text) originalCopy.text = `${originalCopy.text.substring(0, 100)}... (truncated)`;
  normalizedData.original = originalCopy;
  
  // Log normalized data for debugging
  console.log("Email normalized:", {
    from: normalizedData.from,
    subject: normalizedData.subject,
    hasHtml: !!normalizedData.html,
    hasText: !!normalizedData.text,
    attachmentsCount: normalizedData.attachments?.length || 0,
    hasAttachmentContent: normalizedData.attachments?.some(a => !!a.content)
  });
  
  return normalizedData;
}

// Extract and normalize attachments from different email service formats
function processAttachments(data: any): any[] {
  // Safely check if data exists
  if (!data) return [];
  
  // Initialize with empty array as fallback
  let attachments: any[] = [];
  
  // Log all keys to help debug attachment location
  console.log("Looking for attachments in data with keys:", Object.keys(data));
  
  // Handle different attachment field names based on email service providers
  if (Array.isArray(data.attachments)) {
    console.log(`Found ${data.attachments.length} attachments in data.attachments`);
    attachments = data.attachments;
  } else if (Array.isArray(data.Attachments)) {
    console.log(`Found ${data.Attachments.length} attachments in data.Attachments`);
    attachments = data.Attachments;
  } else if (data.attachment && !Array.isArray(data.attachment)) {
    // Some services might provide a single attachment object
    console.log("Found single attachment in data.attachment");
    attachments = [data.attachment];
  } else if (data.Attachment && !Array.isArray(data.Attachment)) {
    console.log("Found single attachment in data.Attachment");
    attachments = [data.Attachment];
  } else if (data.parsedEnvelope && data.parsedEnvelope.attachments) {
    console.log(`Found ${data.parsedEnvelope.attachments.length} attachments in parsedEnvelope`);
    attachments = data.parsedEnvelope.attachments;
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
  const processedAttachments = attachments.map(attachment => {
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
    normalized.size = attachment.size || attachment.Size || 
                     (normalized.content ? normalized.content.length : 0);
    
    console.log(`Processed attachment: ${normalized.filename}, type: ${normalized.contentType}, has content: ${!!normalized.content}, content length: ${normalized.content ? normalized.content.length : 0}`);
    
    return normalized;
  });
  
  return processedAttachments.filter(att => {
    const hasContent = !!att.content && att.content.length > 0;
    if (!hasContent) {
      console.log(`Filtering out attachment ${att.filename} due to missing content`);
    }
    return hasContent;
  });
}
