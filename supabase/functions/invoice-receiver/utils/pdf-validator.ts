
/**
 * Normalize attachment objects to ensure consistent structure
 */
export function normalizeAttachments(attachments: any[]): any[] {
  if (!Array.isArray(attachments)) return [];
  
  // Standardize attachment object structure
  return attachments.map(attachment => {
    if (!attachment) return { filename: "unknown", contentType: "application/octet-stream", content: "", size: 0 };
    
    const normalized: Record<string, any> = {};
    
    // Extract filename with fallbacks
    normalized.filename = attachment.filename || attachment.name || attachment.fileName || 
                          attachment.Filename || attachment.Name || "unknown";
    
    // Extract content type with fallbacks
    normalized.contentType = attachment.contentType || attachment.content_type || 
                           attachment.type || attachment.Type || attachment.mime || 
                           "application/octet-stream";
    
    // Extract content with fallbacks (might be base64 encoded)
    normalized.content = attachment.content || attachment.data || attachment.Content || 
                       attachment.Data || attachment.body || attachment.Body || "";
                       
    // Some services might provide the size
    normalized.size = attachment.size || attachment.Size || 0;
    
    return normalized;
  });
}
