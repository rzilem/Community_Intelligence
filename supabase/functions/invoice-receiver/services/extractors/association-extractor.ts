
/**
 * Helper functions for extracting HOA/association information from email content
 */

export function extractAssociationInformation(content: string): {
  association_name?: string;
} {
  const result: { association_name?: string } = {};
  
  // Common patterns for association names
  const associationPatterns = [
    /association[:\s]+([^,\n\r<>]+)/i,
    /hoa[:\s]+([^,\n\r<>]+)/i,
    /community[:\s]+([^,\n\r<>]+)/i,
    /property[:\s]+([^,\n\r<>]+)/i,
    /for\s+(?:the\s+)?(?:hoa|association)[:\s]+([^,\n\r<>]+)/i,
    /bill\s+to[:\s]+([^,\n\r<>]+)/i
  ];
  
  for (const pattern of associationPatterns) {
    const match = content.match(pattern);
    if (match && match[1] && match[1].trim()) {
      result.association_name = match[1].trim();
      return result;
    }
  }
  
  return result;
}
