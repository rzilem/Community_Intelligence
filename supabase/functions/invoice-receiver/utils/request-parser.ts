
import { parseMultipartFormData } from "./multipart-form-parser.ts";

/**
 * Process multipart form data from request
 */
export async function processMultipartFormData(request: Request): Promise<any> {
  return parseMultipartFormData(request);
}

/**
 * Extract and normalize data from different email webhook formats
 */
export function normalizeEmailData(data: any): any {
  const normalizedData: Record<string, any> = {};
  
  // Handle cases where data might be null or undefined
  if (!data || typeof data !== 'object') {
    console.error("Invalid email data format:", data);
    return {
      from: "",
      to: "",
      subject: "",
      html: "",
      text: "",
      tracking_number: `inv-${Date.now()}`
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
  normalizedData.attachments = data.attachments || [];
  
  // Create a tracking number
  normalizedData.tracking_number = data.message_id || data.messageId || data.id || 
    data.envelope?.messageId || `inv-${Date.now()}`;
  
  return normalizedData;
}
