
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

export function normalizeEmailData(data: any): any {
  const normalizedData: any = {};
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

  if (data.headers && typeof data.headers === 'object') {
    console.log("Detected CloudMailin format with headers object");
    normalizedData.subject = data.headers.Subject || data.headers.subject || "";
    normalizedData.from = data.headers.From || data.headers.from || "";
    normalizedData.to = data.headers.To || data.headers.to || "";
    if (data.plain !== undefined) normalizedData.text = data.plain;
    if (data.html !== undefined) normalizedData.html = data.html;
  }

  normalizedData.from = normalizedData.from || data.from || data.From || data.sender || data.Sender || "";
  normalizedData.to = normalizedData.to || data.to || data.To || data.recipient || data.Recipient || "";
  normalizedData.subject = normalizedData.subject || data.subject || data.Subject || "";
  normalizedData.html = normalizedData.html || data.html || data.Html || data.body || data.Body || "";
  normalizedData.text = normalizedData.text || data.text || data.Text || data.plain || data.Plain || "";
  normalizedData.attachments = processAttachments(data);
  normalizedData.tracking_number = data.message_id || data.messageId || data.id || data.envelope?.messageId || `email-${Date.now()}`;
  normalizedData.original = data;

  return normalizedData;
}

function processAttachments(data: any): any[] {
  if (!data) return [];
  let attachments: any[] = [];

  if (Array.isArray(data.attachments)) {
    console.log(`Using ${data.attachments.length} attachments from data.attachments array`);
    attachments = data.attachments;
  } else if (Array.isArray(data.Attachments)) {
    console.log(`Using ${data.Attachments.length} attachments from data.Attachments array`);
    attachments = data.Attachments;
  } else if (data.attachment && !Array.isArray(data.attachment)) {
    console.log("Using single attachment from data.attachment");
    attachments = [data.attachment];
  } else if (data.Attachment && !Array.isArray(data.Attachment)) {
    console.log("Using single attachment from data.Attachment");
    attachments = [data.Attachment];
  } else if (data.attachments && typeof data.attachments === 'string') {
    try {
      const parsedAttachments = JSON.parse(data.attachments);
      if (Array.isArray(parsedAttachments) && parsedAttachments.length > 0) {
        console.log(`Found ${parsedAttachments.length} attachments in parsed data.attachments string`);
        attachments = parsedAttachments;
      }
    } catch (e) {
      console.log("Could not parse attachments string as JSON");
    }
  } else if (data.email && data.email.attachments) {
    console.log(`Found ${data.email.attachments.length} attachments in data.email.attachments`);
    attachments = data.email.attachments;
  } else {
    for (const key in data) {
      const value = data[key];
      if (Array.isArray(value) && value.length > 0 && value[0] && (value[0].filename || value[0].content || value[0].contentType)) {
        console.log(`Found potential attachments in data.${key}`);
        attachments = value;
        break;
      }
    }
  }

  console.log(`Processing ${attachments.length} attachments`);
  return attachments.map((att: any) => {
    if (!att) return { filename: "unknown", contentType: "application/octet-stream", content: "", size: 0 };

    // Create a normalized attachment object
    const normalized = {
      filename: att.filename || att.name || att.fileName || att.Filename || att.Name || "unknown",
      contentType: att.contentType || att.content_type || att.type || att.Type || att.mime || "application/octet-stream",
      content: att.content || att.data || att.Content || att.Data || att.body || att.Body || "",
      size: att.size || att.Size || 0
    };

    // Validate PDF content if applicable
    if (normalized.contentType === 'application/pdf') {
      if (typeof normalized.content === 'string') {
        const isBase64 = /^([A-Za-z0-9+/]{4})*([A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{2}==)?$/.test(normalized.content.trim());
        if (!isBase64) {
          console.error(`Invalid PDF content for ${normalized.filename}: not base64 encoded`);
          normalized.content = "";
          normalized.contentType = "application/octet-stream";
        } else {
          try {
            const base64Content = normalized.content
              .replace(/^data:application\/pdf;base64,/, '')
              .replace(/\s/g, '');
            // Use TextEncoder to create Uint8Array from base64 string
            const decoded = atob(base64Content);
            const bytes = new Uint8Array(decoded.length);
            for (let i = 0; i < decoded.length; i++) {
              bytes[i] = decoded.charCodeAt(i);
            }
            const pdfHeader = Array.from(bytes.slice(0, 4)).map(b => b.toString(16)).join('');
            if (pdfHeader !== '25504446') {
              console.error(`Invalid PDF header in attachment ${normalized.filename}: ${pdfHeader}`);
              normalized.content = "";
              normalized.contentType = "application/octet-stream";
            }
          } catch (error) {
            console.error(`Error validating PDF content for ${normalized.filename}: ${error.message}`);
            normalized.content = "";
            normalized.contentType = "application/octet-stream";
          }
        }
      } else if (normalized.content instanceof Blob || normalized.content instanceof File) {
        // For Blob or File objects, validation will be done asynchronously when processing
        // Just log that we'll verify this later
        console.log(`Blob/File attachment detected for ${normalized.filename}, will validate when processing`);
      }
    }

    console.log(`Normalized attachment: ${normalized.filename}`, {
      contentType: normalized.contentType,
      size: normalized.size,
      contentTypeOfContent: typeof normalized.content
    });

    return normalized;
  });
}
