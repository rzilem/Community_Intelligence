
/**
 * Validates and processes PDF content
 */
export function validatePdfAttachment(attachment: any): any {
  if (!attachment) return { filename: "unknown", contentType: "application/octet-stream", content: "", size: 0 };

  const normalized = {
    filename: attachment.filename || attachment.name || attachment.fileName || attachment.Filename || attachment.Name || "unknown",
    contentType: attachment.contentType || attachment.content_type || attachment.type || attachment.Type || attachment.mime || "application/octet-stream",
    content: attachment.content || attachment.data || attachment.Content || attachment.Data || attachment.body || attachment.Body || "",
    size: attachment.size || attachment.Size || 0
  };

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
          const binaryString = atob(base64Content);
          const buffer = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            buffer[i] = binaryString.charCodeAt(i);
          }
          const pdfHeader = Array.from(buffer.slice(0, 4)).map(b => b.toString(16)).join('');
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
      console.log(`Blob/File attachment detected for ${normalized.filename}, will validate when processing`);
    }
  }

  console.log(`Normalized attachment: ${normalized.filename}`, {
    contentType: normalized.contentType,
    size: normalized.size,
    contentTypeOfContent: typeof normalized.content
  });

  return normalized;
}

/**
 * Process and normalize all attachments in a collection
 */
export function normalizeAttachments(attachments: any[]): any[] {
  return attachments.map(att => validatePdfAttachment(att));
}
