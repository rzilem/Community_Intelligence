
/**
 * Utilities for working with ZIP codes
 */

export function extractZipCode(address?: string): string {
  if (!address) return '';
  
  const zipPattern = /\b\d{5}(-\d{4})?\b/;
  const zipMatch = address.match(zipPattern);
  
  return zipMatch ? zipMatch[0] : '';
}

export function extractZipCodeFromText(text?: string): string {
  if (!text) return '';
  
  // Look for various formats of ZIP codes in text
  const zipPattern = /\b\d{5}(-\d{4})?\b/;
  const zipMatch = text.match(zipPattern);
  
  return zipMatch ? zipMatch[0] : '';
}
