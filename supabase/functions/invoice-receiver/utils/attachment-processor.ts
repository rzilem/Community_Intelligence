
/**
 * Processes attachments from various email formats and normalizes them
 */
export function processAttachments(data: any): any[] {
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
  return attachments;
}
