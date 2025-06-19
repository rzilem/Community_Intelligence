
import { devLog } from '@/utils/dev-logger';
import { addressIntelligenceService, AddressValidationResult } from './address-intelligence-service';

export interface AddressEnrichmentResult {
  originalAddress: string;
  enrichedData: {
    validatedAddress?: AddressValidationResult;
    coordinates?: { latitude: number; longitude: number };
    propertyInfo?: {
      county: string;
      estimatedValue?: number;
      propertyType?: string;
    };
    confidence: number;
  };
  issues: string[];
  suggestions: string[];
}

export class AddressEnrichmentService {
  async enrichAddresses(addresses: string[]): Promise<AddressEnrichmentResult[]> {
    devLog.info(`Starting address enrichment for ${addresses.length} addresses`);
    
    try {
      // Batch validate all addresses
      const validationResults = await addressIntelligenceService.batchValidateAddresses(addresses);
      
      const enrichmentResults: AddressEnrichmentResult[] = [];
      
      for (let i = 0; i < addresses.length; i++) {
        const address = addresses[i];
        const validation = validationResults[i];
        
        const result = await this.enrichSingleAddress(address, validation);
        enrichmentResults.push(result);
      }
      
      devLog.info(`Address enrichment completed. ${enrichmentResults.length} addresses processed`);
      return enrichmentResults;
      
    } catch (error) {
      devLog.error('Address enrichment failed:', error);
      
      // Return basic results for all addresses
      return addresses.map(address => ({
        originalAddress: address,
        enrichedData: {
          confidence: 0
        },
        issues: ['Address enrichment service unavailable'],
        suggestions: []
      }));
    }
  }

  private async enrichSingleAddress(
    address: string, 
    validation: AddressValidationResult
  ): Promise<AddressEnrichmentResult> {
    const issues: string[] = [];
    const suggestions: string[] = [];
    
    // Check validation results
    if (!validation.isValid) {
      issues.push('Address could not be validated');
      if (validation.suggestions) {
        suggestions.push(...validation.suggestions);
      }
    }
    
    if (validation.confidence < 0.7) {
      issues.push('Low confidence in address validation');
      suggestions.push('Consider manual review of this address');
    }
    
    // Get additional property information
    let propertyInfo;
    try {
      propertyInfo = await addressIntelligenceService.getPropertyInfo(address);
      if (propertyInfo) {
        devLog.info(`Retrieved property info for ${address}:`, propertyInfo);
      }
    } catch (error) {
      devLog.warn(`Could not retrieve property info for ${address}:`, error);
      issues.push('Property information unavailable');
    }
    
    // Extract coordinates
    const coordinates = validation.geocoding ? {
      latitude: validation.geocoding.latitude,
      longitude: validation.geocoding.longitude
    } : undefined;
    
    if (!coordinates) {
      issues.push('Geocoding not available');
      suggestions.push('Address may not be mappable');
    }
    
    // Determine overall confidence
    let overallConfidence = validation.confidence;
    
    if (propertyInfo) overallConfidence += 0.1;
    if (coordinates) overallConfidence += 0.05;
    
    overallConfidence = Math.min(overallConfidence, 1.0);
    
    return {
      originalAddress: address,
      enrichedData: {
        validatedAddress: validation,
        coordinates,
        propertyInfo: propertyInfo ? {
          county: propertyInfo.county,
          estimatedValue: propertyInfo.estimatedValue,
          propertyType: this.inferPropertyType(address, validation)
        } : undefined,
        confidence: overallConfidence
      },
      issues,
      suggestions
    };
  }
  
  private inferPropertyType(address: string, validation: AddressValidationResult): string | undefined {
    const addressLower = address.toLowerCase();
    
    // Simple property type inference
    if (addressLower.includes('apt') || addressLower.includes('unit') || addressLower.includes('#')) {
      return 'apartment';
    } else if (addressLower.includes('condo') || addressLower.includes('condominium')) {
      return 'condo';
    } else if (addressLower.includes('townhouse') || addressLower.includes('townhome')) {
      return 'townhouse';
    } else {
      return 'single_family';
    }
  }
  
  async validateAndEnrichSingleAddress(address: string): Promise<AddressEnrichmentResult> {
    const validation = await addressIntelligenceService.validateAddress(address);
    return this.enrichSingleAddress(address, validation);
  }
  
  // Utility method to get standardized address from enrichment result
  getStandardizedAddress(result: AddressEnrichmentResult): string | null {
    if (!result.enrichedData.validatedAddress?.isValid) {
      return null;
    }
    
    const std = result.enrichedData.validatedAddress.standardizedAddress;
    return `${std.street}, ${std.city}, ${std.state} ${std.zipCode}`;
  }
  
  // Method to extract coordinates for mapping
  getCoordinates(result: AddressEnrichmentResult): { lat: number; lng: number } | null {
    return result.enrichedData.coordinates ? {
      lat: result.enrichedData.coordinates.latitude,
      lng: result.enrichedData.coordinates.longitude
    } : null;
  }
}

export const addressEnrichmentService = new AddressEnrichmentService();
