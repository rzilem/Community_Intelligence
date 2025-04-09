
/**
 * Helper functions for extracting association information from email content
 */

export interface AssociationInfo {
  name?: string;
  type?: string;
  units?: number;
}

// Common association types to match in text
export const ASSOCIATION_TYPES = [
  "condo", "condominium", "townhome", "townhouse", "single family", 
  "hoa", "homeowners", "commercial", "community", "residential", 
  "apartment", "co-op", "cooperative"
];

// Helper function to extract association information
export function extractAssociationInfo(content: string): AssociationInfo {
  const result: AssociationInfo = {};
  
  // Extract association name
  const namePatterns = [
    /[Aa]ssociation\s*[Nn]ame[:\s]*([^,\n<]+)/,
    /[Nn]ame\s*of\s*[Aa]ssociation[:\s]*([^,\n<]+)/,
    /[Cc]ommunity\s*[Nn]ame[:\s]*([^,\n<]+)/,
    /[Hh][Oo][Aa]\s*[Nn]ame[:\s]*([^,\n<]+)/
  ];
  
  for (const pattern of namePatterns) {
    const match = content.match(pattern);
    if (match && match[1] && match[1].trim()) {
      result.name = match[1].trim();
      break;
    }
  }
  
  // Extract association type
  const typePatterns = [
    /[Aa]ssociation\s*[Tt]ype[:\s]*([^,\n<]+)/,
    /[Tt]ype\s*of\s*[Aa]ssociation[:\s]*([^,\n<]+)/,
    /[Pp]roperty\s*[Tt]ype[:\s]*([^,\n<]+)/
  ];
  
  for (const pattern of typePatterns) {
    const match = content.match(pattern);
    if (match && match[1] && match[1].trim()) {
      result.type = match[1].trim().toLowerCase();
      break;
    }
  }
  
  // If no explicit type pattern found, try to infer from context
  if (!result.type) {
    const contentLower = content.toLowerCase();
    for (const type of ASSOCIATION_TYPES) {
      if (contentLower.includes(type)) {
        result.type = type;
        break;
      }
    }
  }
  
  // Extract number of units
  const unitsPatterns = [
    /(\d+)\s*units/i,
    /(\d+)\s*homes/i,
    /(\d+)\s*properties/i,
    /(\d+)\s*condos/i,
    /(\d+)\s*townhomes/i,
    /(\d+)\s*townhouses/i,
    /(\d+)\s*residences/i,
    /number\s*of\s*units[:\s]*(\d+)/i,
    /unit\s*count[:\s]*(\d+)/i,
    /units[:\s]*(\d+)/i
  ];
  
  for (const pattern of unitsPatterns) {
    const match = content.match(pattern);
    if (match && match[1]) {
      result.units = parseInt(match[1], 10);
      if (!isNaN(result.units)) {
        break;
      }
    }
  }
  
  return result;
}
