
/**
 * Processes multipart form data from an HTTP request
 */
export async function processMultipartFormData(request: Request): Promise<any> {
  const contentType = request.headers.get("content-type");
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

  const result: any = {};
  console.log("Form data keys:", Array.from(formData.keys()));
  
  for (const [key, value] of formData.entries()) {
    console.log(`FormData entry: ${key}`, {
      type: typeof value,
      isFile: value instanceof File,
      isBlob: value instanceof Blob,
      filename: value instanceof File ? value.name : 'unknown',
      size: value instanceof File ? value.size : 'unknown'
    });

    if (key.startsWith('attachments[') || key === 'attachments[]') {
      console.log(`Found potential CloudMailin attachment with key: ${key}`);
      if (!result.attachments) result.attachments = [];
      if (value instanceof File || value instanceof Blob) {
        const fileContent = value;
        const fileName = value instanceof File ? value.name : key.replace(/attachments\[\d*\]/, 'attachment');
        const contentType = value instanceof File ? value.type : 'application/octet-stream';
        console.log(`Processing file attachment: name=${fileName}, type=${contentType}, size=${fileContent.size}`);
        result.attachments.push({
          filename: fileName,
          contentType: contentType,
          content: fileContent,
          size: fileContent.size
        });
      }
    } else if (key.startsWith('attachment_details[') || key === 'attachment_details[]') {
      console.log(`Found attachment details with key: ${key}, value: ${value}`);
      if (!result.attachment_details) result.attachment_details = [];
      if (typeof value === 'string') {
        try {
          const parsedValue = JSON.parse(value);
          result.attachment_details.push(parsedValue);
        } catch {
          result.attachment_details.push(value);
        }
      } else {
        result.attachment_details.push(value);
      }
    } else if (typeof value === "string") {
      try {
        result[key] = JSON.parse(value);
      } catch {
        result[key] = value;
      }
    } else {
      result[key] = value;
    }
  }

  if (result.attachments && result.attachment_details) {
    console.log("Matching attachment details with files");
    try {
      for (let i = 0; i < result.attachments.length; i++) {
        const att = result.attachments[i];
        const details = result.attachment_details[i];
        if (details) {
          if (typeof details === 'object') {
            att.filename = details.filename || att.filename;
            att.contentType = details.content_type || details.contentType || att.contentType;
          } else if (typeof details === 'string') {
            try {
              const detailsObj = JSON.parse(details);
              att.filename = detailsObj.filename || att.filename;
              att.contentType = detailsObj.content_type || detailsObj.contentType || att.contentType;
            } catch {}
          }
        }
      }
    } catch (matchError) {
      console.error("Error matching attachment details:", matchError);
    }
    delete result.attachment_details;
  }

  console.log("Processed form data result:", Object.keys(result));
  if (result.attachments) {
    console.log(`Found ${result.attachments.length} attachments in form data`);
  }
  return result;
}
