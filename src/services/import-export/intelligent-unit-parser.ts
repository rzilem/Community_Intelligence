
import { devLog } from '@/utils/dev-logger';

export interface ParsedUnitInfo {
  unitNumber: string;
  streetAddress: string;
  fullAddress: string;
  confidence: number;
  parsingMethod: string;
}

export const intelligentUnitParser = {
  parseUnitFromPath(folderPath: string): ParsedUnitInfo | null {
    devLog.info('Parsing unit info from path:', folderPath);

    // Remove file extensions and clean the path
    const cleanPath = folderPath.replace(/\.(pdf|doc|docx|jpg|jpeg|png|txt)$/i, '');
    const pathSegments = cleanPath.split('/').filter(segment => segment.trim());
    
    // Try different parsing strategies
    for (const segment of pathSegments) {
      const result = this.tryParseUnitFromSegment(segment);
      if (result) {
        devLog.info('Successfully parsed unit info:', result);
        return result;
      }
    }

    devLog.warn('Could not parse unit info from path:', folderPath);
    return null;
  },

  tryParseUnitFromSegment(segment: string): ParsedUnitInfo | null {
    const trimmed = segment.trim();
    
    // Strategy 1: Full address with unit (e.g., "1490 Rusk Rd. Unit 301")
    const fullAddressMatch = trimmed.match(/^(\d+\s+[^,]+?)\s+Unit\s+(\w+)/i);
    if (fullAddressMatch) {
      return {
        unitNumber: fullAddressMatch[2],
        streetAddress: fullAddressMatch[1],
        fullAddress: trimmed,
        confidence: 0.95,
        parsingMethod: 'full_address_with_unit'
      };
    }

    // Strategy 2: Address with apartment/apt (e.g., "1490 Rusk Rd. Apt 301")
    const aptMatch = trimmed.match(/^(\d+\s+[^,]+?)\s+(Apt|Apartment)\s+(\w+)/i);
    if (aptMatch) {
      return {
        unitNumber: aptMatch[3],
        streetAddress: aptMatch[1],
        fullAddress: trimmed,
        confidence: 0.9,
        parsingMethod: 'address_with_apt'
      };
    }

    // Strategy 3: Unit number only (e.g., "Unit 301", "301")
    const unitOnlyMatch = trimmed.match(/^Unit\s+(\w+)$/i) || trimmed.match(/^(\d+[A-Z]?)$/);
    if (unitOnlyMatch) {
      return {
        unitNumber: unitOnlyMatch[1],
        streetAddress: '',
        fullAddress: trimmed,
        confidence: 0.6,
        parsingMethod: 'unit_only'
      };
    }

    // Strategy 4: Complex formats with building info
    const complexMatch = trimmed.match(/Building\s+\w+.*Unit\s+(\w+)/i);
    if (complexMatch) {
      return {
        unitNumber: complexMatch[1],
        streetAddress: '',
        fullAddress: trimmed,
        confidence: 0.7,
        parsingMethod: 'complex_building_unit'
      };
    }

    return null;
  },

  fuzzyMatchProperty(parsedInfo: ParsedUnitInfo, existingProperties: any[]): any | null {
    devLog.info('Fuzzy matching property:', parsedInfo);

    // Exact unit number match
    const exactUnitMatch = existingProperties.find(prop => 
      prop.unit_number && prop.unit_number.toLowerCase() === parsedInfo.unitNumber.toLowerCase()
    );
    if (exactUnitMatch) {
      devLog.info('Found exact unit match:', exactUnitMatch);
      return exactUnitMatch;
    }

    // Address-based matching
    if (parsedInfo.streetAddress) {
      const addressMatch = existingProperties.find(prop => 
        prop.address && this.normalizeAddress(prop.address).includes(this.normalizeAddress(parsedInfo.streetAddress))
      );
      if (addressMatch) {
        devLog.info('Found address match:', addressMatch);
        return addressMatch;
      }
    }

    // Partial unit number matching (e.g., "301" matches "Unit 301")
    const partialUnitMatch = existingProperties.find(prop => 
      prop.unit_number && (
        prop.unit_number.toLowerCase().includes(parsedInfo.unitNumber.toLowerCase()) ||
        parsedInfo.unitNumber.toLowerCase().includes(prop.unit_number.toLowerCase())
      )
    );
    if (partialUnitMatch) {
      devLog.info('Found partial unit match:', partialUnitMatch);
      return partialUnitMatch;
    }

    devLog.warn('No fuzzy match found for:', parsedInfo);
    return null;
  },

  normalizeAddress(address: string): string {
    return address.toLowerCase()
      .replace(/\b(street|st|avenue|ave|road|rd|drive|dr|lane|ln|court|ct|place|pl)\b/g, '')
      .replace(/[^\w\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  },

  extractAssociationName(folderPath: string): string | null {
    const pathSegments = folderPath.split('/').filter(segment => segment.trim());
    
    // Usually the first segment is the association name
    if (pathSegments.length > 0) {
      const firstSegment = pathSegments[0].trim();
      // Skip if it looks like a file name
      if (!firstSegment.includes('.') || firstSegment.split('.').length === 2) {
        return firstSegment;
      }
    }
    
    return null;
  }
};
