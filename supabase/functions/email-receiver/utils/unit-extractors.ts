
/**
 * Extracts number of units from email content
 */
export function extractUnitCount(content: string): number | null {
  if (!content) return null;
  
  // Look for patterns like "### units", "### unit", "### homes", "### apartments", etc.
  const unitPatterns = [
    /(\d+,?\d*)\s*units?/i,
    /(\d+,?\d*)\s*homes?/i,
    /(\d+,?\d*)\s*apartments?/i,
    /(\d+,?\d*)\s*properties?/i,
    /(\d+,?\d*)\s*doors?/i, // Industry term for units
    /property has\s*(\d+,?\d*)/i,
    /community of\s*(\d+,?\d*)/i,
    /community with\s*(\d+,?\d*)/i,
    /(\d+,?\d*)\s*-?\s*unit community/i,
    /(\d+,?\d*)\s*-?\s*unit property/i
  ];
  
  for (const pattern of unitPatterns) {
    const match = content.match(pattern);
    if (match && match[1]) {
      // Remove commas and convert to number
      const unitCount = parseInt(match[1].replace(/,/g, ''), 10);
      if (!isNaN(unitCount)) {
        return unitCount;
      }
    }
  }
  
  return null;
}
