
/**
 * Type definitions for email data
 */

export interface EmailAttachment {
  filename: string;
  contentType: string;
  content: string | Blob | File | Uint8Array;
  size: number;
  url?: string;
}

export interface NormalizedEmail {
  from: string;
  to: string;
  subject: string;
  html: string;
  text: string;
  tracking_number: string;
  attachments?: EmailAttachment[];
  original?: any;
}
