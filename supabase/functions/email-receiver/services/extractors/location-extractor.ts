
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
  
  return lead;
}
