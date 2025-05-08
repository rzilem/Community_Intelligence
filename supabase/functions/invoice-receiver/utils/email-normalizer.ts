
import { processAttachments } from "../services/attachment-processor.ts";
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
    
    // Log HTML content details for debugging
    if (data.html) {
      console.log("CloudMailin HTML content detected:", {
        length: data.html.length,
        excerpt: data.html.substring(0, 100) + '...'
      });
    } else {
      console.log("No HTML content in CloudMailin format");
    }
  }

  // Handle different field names for common email properties
  normalizedData.from = normalizedData.from || data.from || data.From || data.sender || data.Sender || "";
  normalizedData.to = normalizedData.to || data.to || data.To || data.recipient || data.Recipient || "";
  normalizedData.subject = normalizedData.subject || data.subject || data.Subject || "";
  normalizedData.html = normalizedData.html || data.html || data.Html || data.body || data.Body || "";
  normalizedData.text = normalizedData.text || data.text || data.Text || data.plain || data.Plain || "";
  
  // Log content details
  console.log("Email normalization result:", {
    hasHtml: !!normalizedData.html,
    htmlLength: normalizedData.html ? normalizedData.html.length : 0,
    hasText: !!normalizedData.text,
    textLength: normalizedData.text ? normalizedData.text.length : 0
  });
  
  const rawAttachments = processAttachments(data);
  normalizedData.attachments = normalizeAttachments(rawAttachments);
  
  normalizedData.tracking_number = data.message_id || data.messageId || data.id || data.envelope?.messageId || `email-${Date.now()}`;
  normalizedData.original = data;

  return normalizedData;
}
