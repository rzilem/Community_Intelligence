
import { extractAssociationInfo } from "../../utils/association-extractors.ts";

/**
 * Extract all association-related information from the email content
 */
export function extractAssociationInformation(content: string) {
  console.log("Extracting association information");
  const lead: Record<string, any> = {};
  
  // Extract association information
  const associationInfo = extractAssociationInfo(content);
  console.log("Association info extracted:", associationInfo);
  
  if (associationInfo.name) lead.association_name = associationInfo.name;
  if (associationInfo.type) lead.association_type = associationInfo.type;
  if (associationInfo.units) lead.number_of_units = associationInfo.units;
  
  return lead;
}
