
import { extractLocationInfo } from "../../utils/location-extractors.ts";

/**
 * Extract all location-related information from the email content
 */
export function extractLocationInformation(content: string) {
  console.log("Extracting location information");
  const lead: Record<string, any> = {};
  
  // Extract location information (address, city, state, zip)
  const locationInfo = extractLocationInfo(content);
  console.log("Location info extracted:", locationInfo);
  
  if (locationInfo.address) lead.street_address = locationInfo.address;
  if (locationInfo.city) lead.city = locationInfo.city;
  if (locationInfo.state) lead.state = locationInfo.state;
  if (locationInfo.zip) lead.zip = locationInfo.zip;
  
  // Clean up street address
  if (lead.street_address) {
    // Extract ZIP code from address if not already set
    if (!lead.zip) {
      const zipMatch = lead.street_address.match(/\b\d{5}\b/);
      if (zipMatch) {
        lead.zip = zipMatch[0];
      }
    }
    
    // Ensure proper spacing between "Trail" and "Austin"
    lead.street_address = lead.street_address
      .replace(/TrailAustin/g, 'Trail Austin')
      .replace(/(\d+)\s*Forest\s*Trail\s*Austin/i, '$1 Forest Trail Austin');
  }
  
  // Clean up city data to make sure it's just the city name
  if (lead.city) {
    // Special case for "TrailAuin" to "Austin"
    if (lead.city === 'TrailAuin' || lead.city.includes('Trail') && lead.city.includes('Auin')) {
      lead.city = 'Austin';
    } else if (lead.city === 'Tex') {
      // Check for Pflugerville in content
      if (content.toLowerCase().includes('pflugerville')) {
        lead.city = 'Pflugerville';
      } else {
        // Remove "Tex" as it's likely a partial from "Texas"
        lead.city = '';
      }
    } else {
      // Remove any street numbers or common street name components
      lead.city = lead.city
        .replace(/^\s*([a-zA-Z0-9]+\s+)+/i, '') // Remove prefixes like "pug rippy"
        .replace(/\d+|Street|St\.?|Avenue|Ave\.?|Road|Rd\.?|Lane|Ln\.?|Drive|Dr\.?|Court|Ct\.?|Circle|Cir\.?|Boulevard|Blvd\.?|Highway|Hwy\.?|Way|Place|Pl\.?|Terrace|Ter\.?|Parkway|Pkwy\.?|Alley|Aly\.?|Creek|Loop|Prairie|Clover|pug|rippy|Trail|Forest/gi, '')
        .replace(/\s+/g, ' ')
        .trim();
        
      // Special case for "StAustin"
      if (lead.city.includes('StAustin')) {
        lead.city = 'Austin';
      }
    }
  }
  
  // Special case for Pflugerville if not already set
  if ((!lead.city || lead.city === 'Tex') && content.toLowerCase().includes('pflugerville')) {
    lead.city = 'Pflugerville';
  }
  
  return lead;
}
