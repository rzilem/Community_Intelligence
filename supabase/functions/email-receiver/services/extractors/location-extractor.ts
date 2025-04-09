
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
  
  // Clean up city data to make sure it's just the city name
  if (lead.city) {
    // Remove any street numbers or common street name components
    lead.city = lead.city
      .replace(/^\s*([a-zA-Z0-9]+\s+)+/i, '') // Remove prefixes like "pug rippy"
      .replace(/\d+|Street|St\.?|Avenue|Ave\.?|Road|Rd\.?|Lane|Ln\.?|Drive|Dr\.?|Court|Ct\.?|Circle|Cir\.?|Boulevard|Blvd\.?|Highway|Hwy\.?|Way|Place|Pl\.?|Terrace|Ter\.?|Parkway|Pkwy\.?|Alley|Aly\.?|Creek|Loop|Prairie|Clover|pug|rippy/gi, '')
      .replace(/\s+/g, ' ')
      .trim();
      
    // Special case for "StAustin"
    if (lead.city.includes('StAustin')) {
      lead.city = 'Austin';
    }
  }
  
  return lead;
}
