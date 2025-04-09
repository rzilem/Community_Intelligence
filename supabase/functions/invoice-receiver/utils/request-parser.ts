
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
  
  // Handle attachments
  normalizedData.attachments = data.attachments || data.Attachments || [];
  
  // Add original data for reference
  normalizedData.original = data;
  
  return normalizedData;
}
