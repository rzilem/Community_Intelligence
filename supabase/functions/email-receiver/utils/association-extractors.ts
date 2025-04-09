
/**
 * Helper functions for extracting association information from email content
 */

export interface AssociationInfo {
  name?: string;
  type?: string;
  units?: number;
}

// Association type constants
export const ASSOCIATION_TYPES = {
  HOA: 'HOA',
  CONDO: 'Condo'
};

// Helper function to extract association information from email content
export function extractAssociationInfo(content: string): AssociationInfo {
  const result: AssociationInfo = {};
  
  // Extract association type with simplified approach
  extractAssociationType(content, result);
  
  // Extract association name
  extractAssociationName(content, result);
  
  // Extract number of units
  extractUnitCount(content, result);
  
  return result;
}

// Extract the association type (HOA or Condo)
function extractAssociationType(content: string, result: AssociationInfo): void {
  // First check for specific type mentions
  if (/HOA/i.test(content)) {
    result.type = ASSOCIATION_TYPES.HOA;
    return;
  }
  
  if (/Condo Association|Condominium/i.test(content)) {
    result.type = ASSOCIATION_TYPES.CONDO;
    return;
  }
  
  // If type still not found, try more general patterns
  const typePatterns = [
    /Association Type[:\s]*([^<>\n\r,.]+)/i,
    /Type of Association[:\s]*([^<>\n\r,.]+)/i,
    /Type[:\s]*(HOA|Condo|Condominium|Townhome|Single-Family)/i,
    /The property is a[:\s]*(HOA|Condo|Condominium|Townhome|Single-Family)/i,
    /It is a[:\s]*(HOA|Condo|Condominium|Townhome|Single-Family)/i
  ];
  
  for (const pattern of typePatterns) {
    const match = content.match(pattern);
    if (match && match[1] && match[1].trim()) {
      const type = match[1].trim().toLowerCase();
      
      // Determine if HOA or Condo based on the matched text
      if (type.includes('hoa') || type.includes('home') || type.includes('single-family')) {
        result.type = ASSOCIATION_TYPES.HOA;
      } else if (type.includes('condo') || type.includes('townhome') || type.includes('town')) {
        result.type = ASSOCIATION_TYPES.CONDO;
      }
      
      if (result.type) return;
    }
  }
}

// Extract the association name
function extractAssociationName(content: string, result: AssociationInfo): void {
  const namePatterns = [
    /Name of Association[:\s]*([^<>\n\r]+)/i,
    /Association Name[:\s]*([^<>\n\r]+)/i,
    /HOA Name[:\s]*([^<>\n\r]+)/i,
    /Community Name[:\s]*([^<>\n\r]+)/i
  ];
  
  for (const pattern of namePatterns) {
    const match = content.match(pattern);
    if (match && match[1] && match[1].trim()) {
      result.name = match[1].trim();
      break;
    }
  }
}

// Extract the number of units
function extractUnitCount(content: string, result: AssociationInfo): void {
  const unitsPatterns = [
    /Number of Homes or Units[:\s]*([0-9,]+)/i,
    /Units[:\s]*([0-9,]+)/i,
    /Homes[:\s]*([0-9,]+)/i,
    /Properties[:\s]*([0-9,]+)/i,
    /Total Units[:\s]*([0-9,]+)/i
  ];
  
  for (const pattern of unitsPatterns) {
    const match = content.match(pattern);
    if (match && match[1]) {
      // Remove commas from numbers like "1,525"
      const cleanNumber = match[1].replace(/,/g, '');
      const units = parseInt(cleanNumber, 10);
      if (!isNaN(units)) {
        result.units = units;
        break;
      }
    }
  }
}
