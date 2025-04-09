
// Process raw multipart form data using native FormData API
export async function processMultipartFormData(request: Request): Promise<any> {
  const contentType = request.headers.get("content-type");
  if (!contentType || !contentType.includes("multipart/form-data")) {
    return await request.json();
  }

  console.log("Processing multipart form data");
  const formData = await request.formData();
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

  console.log("Processed form data:", result);
  return result;
}

// Function to extract the most important fields from different email webhook formats
export function normalizeEmailData(data: any): any {
  const normalizedData: Record<string, any> = {};
  
  // Handle different field names for common email properties
  normalizedData.from = data.from || data.From || data.sender || data.Sender || "";
  normalizedData.to = data.to || data.To || data.recipient || data.Recipient || "";
  normalizedData.subject = data.subject || data.Subject || "";
  normalizedData.html = data.html || data.Html || data.body || data.Body || "";
  normalizedData.text = data.text || data.Text || data.plain || data.Plain || "";
  
  // Process attachments from various email services
  normalizedData.attachments = processAttachments(data);
  
  // Add original data for reference
  normalizedData.original = data;
  
  return normalizedData;
}

// Extract and normalize attachments from different email service formats
function processAttachments(data: any): any[] {
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
  
  // Standardize attachment object structure
  return attachments.map(attachment => {
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
