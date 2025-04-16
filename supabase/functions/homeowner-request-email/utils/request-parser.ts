
/**
 * Functions for parsing and normalizing email webhook data
 */

// Process raw multipart form data using native FormData API
export async function processMultipartFormData(request: Request): Promise<any> {
  const contentType = request.headers.get("content-type") || "";
  if (!contentType.includes("multipart/form-data")) {
    throw new Error(`Not a multipart form: ${contentType}`);
  }

  console.log("Processing multipart form data");
  const formData = await request.formData();
  const result: Record<string, any> = {};
  
  console.log("Form data entries:", [...formData.keys()]);
  
  // Process each form field
  for (const [key, value] of formData.entries()) {
    console.log(`Processing form field: ${key}, type: ${typeof value}`);
    
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
  
  const normalizedData: Record<string, any> = {};
  
  // CloudMailin specific format handling
  if (data.headers && typeof data.headers === 'object') {
    console.log("Detected CloudMailin format with headers object");
    normalizedData.subject = data.headers.Subject || data.headers.subject || "";
    normalizedData.from = data.headers.From || data.headers.from || "";
    normalizedData.to = data.headers.To || data.headers.to || "";
  }
  
  // Handle different field names for common email properties
  normalizedData.from = normalizedData.from || data.from || data.From || data.sender || data.Sender || "";
  normalizedData.to = normalizedData.to || data.to || data.To || data.recipient || data.Recipient || "";
  normalizedData.subject = normalizedData.subject || data.subject || data.Subject || "";
  
  // Content fields
  normalizedData.html = data.html || data.Html || data.body_html || data.body || data.Body || "";
  normalizedData.text = data.text || data.Text || data.body_plain || data.plain || data.Plain || "";
  
  // If we have CloudMailin specific structure
  if (data.plain && !normalizedData.text) normalizedData.text = data.plain;
  if (data.html && !normalizedData.html) normalizedData.html = data.html;
  
  // Create a tracking number from email ID or message ID
  normalizedData.tracking_number = data.message_id || data.messageId || data.id || 
    data.envelope?.messageId || `email-${Date.now()}`;
  
  // Add raw email data for debugging
  normalizedData.raw_email = data;
  
  console.log("Normalized email fields:", 
    `from: ${normalizedData.from?.substring(0, 30) || 'missing'}, ` +
    `to: ${normalizedData.to?.substring(0, 30) || 'missing'}, ` + 
    `subject: ${normalizedData.subject || 'missing'}, ` +
    `html: ${normalizedData.html ? 'present' : 'missing'} (${normalizedData.html?.length || 0} chars), ` +
    `text: ${normalizedData.text ? 'present' : 'missing'} (${normalizedData.text?.length || 0} chars)`
  );
  
  return normalizedData;
}
