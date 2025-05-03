
import { processAttachments } from "./attachment-processor.ts";
import { normalizeAttachments } from "./pdf-validator.ts";

/**
 * Normalizes email data from various email service formats
 */
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
  
  const rawAttachments = processAttachments(data);
  normalizedData.attachments = normalizeAttachments(rawAttachments);
  
  normalizedData.tracking_number = data.message_id || data.messageId || data.id || data.envelope?.messageId || `email-${Date.now()}`;
  normalizedData.original = data;

  return normalizedData;
}
