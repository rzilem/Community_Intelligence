
/**
 * Helper functions for extracting HOA/association information from email content
 */

export function extractAssociationInformation(content: string): {
  association_name?: string;
  association_type?: string;
} {
  const result: { association_name?: string; association_type?: string } = {};
  
  // Special case for Falcon Pointe Community Association
  if (content.includes("Falcon Pointe Community Association") || 
      content.includes("falconpointecommunity.com")) {
    result.association_name = "Falcon Pointe Community Association";
    result.association_type = "HOA";
    return result;
  }
  
  // Common patterns for association names
  const associationPatterns = [
    /association[:\s]+([^,\n\r<>]+)/i,
    /hoa[:\s]+([^,\n\r<>]+)/i,
    /community[:\s]+([^,\n\r<>]+)/i,
    /property[:\s]+([^,\n\r<>]+)/i,
    /for\s+(?:the\s+)?(?:hoa|association)[:\s]+([^,\n\r<>]+)/i,
    /bill\s+to[:\s]+([^,\n\r<>]+)/i,
    /([A-Za-z\s]+(?:Community Association|HOA|Homeowners Association|Condominium Association))/i
  ];
  
  for (const pattern of associationPatterns) {
    const match = content.match(pattern);
    if (match && match[1] && match[1].trim()) {
      result.association_name = match[1].trim();
      
      // If association name contains HOA-related terms, set type to HOA
      if (result.association_name.toLowerCase().includes("hoa") || 
          result.association_name.toLowerCase().includes("homeowner") ||
          result.association_name.toLowerCase().includes("community association")) {
        result.association_type = "HOA";
      }
      
      break;
    }
  }
  
  // Check for association type patterns if not already determined
  if (!result.association_type) {
    const typePatterns = [
      /association\s+type[:\s]+([^,\n\r<>]+)/i,
      /type\s+of\s+association[:\s]+([^,\n\r<>]+)/i,
      /\b(HOA|Condominium Association|Homeowners Association)\b/i
    ];
    
    for (const pattern of typePatterns) {
      const match = content.match(pattern);
      if (match) {
        result.association_type = match[1] ? match[1].trim() : "HOA";
        break;
      }
    }
  }
  
  return result;
}
