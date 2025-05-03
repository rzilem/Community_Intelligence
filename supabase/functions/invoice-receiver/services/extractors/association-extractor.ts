
export function extractAssociationInformation(content: string): {
  association_name?: string;
  association_type?: string;
} {
  const result: { association_name?: string; association_type?: string } = {};
  
  console.log("Extracting association information");
  
  // Check for known associations first
  if (content.includes("Falcon Pointe Community Association") || 
      content.includes("falconpointecommunity.com")) {
    result.association_name = "Falcon Pointe Community Association";
    result.association_type = "HOA";
    console.log(`Identified known association: ${result.association_name}`);
    return result;
  }
  
  // Try to extract association name using various patterns
  const associationPatterns = [
    /association[:\s]+([^,\n\r<>]+)/i,
    /hoa[:\s]+([^,\n\r<>]+)/i,
    /community[:\s]+([^,\n\r<>]+)/i,
    /property[:\s]+([^,\n\r<>]+)/i,
    /for\s+(?:the\s+)?(?:hoa|association)[:\s]+([^,\n\r<>]+)/i,
    /bill\s+to[:\s]+([^,\n\r<>]+)/i,
    /([A-Za-z\s]+(?:Community Association|HOA|Homeowners Association|Condominium Association))/i,
    /ATTN[:\s]+([^,\n\r<>]+(?:Association|HOA|Community))/i,
    /RE[:\s]+([^,\n\r<>]+(?:Association|HOA|Community))/i,
    /To[:\s]+([^,\n\r<>]+(?:Association|HOA|Community))/i
  ];
  
  for (const pattern of associationPatterns) {
    const match = content.match(pattern);
    if (match && match[1] && match[1].trim()) {
      result.association_name = match[1].trim();
      
      // Try to determine association type from the name
      if (result.association_name.toLowerCase().includes("hoa") || 
          result.association_name.toLowerCase().includes("homeowner") ||
          result.association_name.toLowerCase().includes("community association")) {
        result.association_type = "HOA";
      }
      
      console.log(`Extracted association name: ${result.association_name}`);
      console.log(`Determined association type: ${result.association_type || 'unknown'}`);
      break;
    }
  }
  
  // If we have a name but no type, try to determine type separately
  if (result.association_name && !result.association_type) {
    const typePatterns = [
      /association\s+type[:\s]+([^,\n\r<>]+)/i,
      /type\s+of\s+association[:\s]+([^,\n\r<>]+)/i,
      /\b(HOA|Condominium Association|Homeowners Association)\b/i
    ];
    
    for (const pattern of typePatterns) {
      const match = content.match(pattern);
      if (match) {
        result.association_type = match[1] ? match[1].trim() : "HOA";
        console.log(`Separately extracted association type: ${result.association_type}`);
        break;
      }
    }
  }
  
  // If still no association information, check for specific keywords
  if (!result.association_name) {
    if (content.includes("community") || content.includes("association") || 
        content.includes("residence") || content.includes("property")) {
      // Look for proper nouns near these keywords
      const nearbyNamePattern = /([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,5})\s+(?:Community|Association|Residence|Property)/i;
      const match = content.match(nearbyNamePattern);
      if (match && match[1]) {
        result.association_name = match[1].trim();
        result.association_type = "HOA";
        console.log(`Extracted association from context: ${result.association_name}`);
      }
    }
  }
  
  console.log(`Final association extraction result:`, result);
  return result;
}
