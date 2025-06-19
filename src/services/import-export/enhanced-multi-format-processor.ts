
import { devLog } from '@/utils/dev-logger';
import { multiFormatProcessor } from './multi-format-processor';
import { addressEnrichmentService, AddressEnrichmentResult } from './address-enrichment-service';
import { 
  ProcessedDocument, 
  ProcessingOptions, 
  MultiFormatProcessingResult 
} from './types';

export interface EnhancedProcessingOptions extends ProcessingOptions {
  enableAddressValidation?: boolean;
  enableGeocoding?: boolean;
  enablePropertyEnrichment?: boolean;
  addressFields?: string[]; // Field names that contain addresses
}

export interface EnhancedProcessingResult extends MultiFormatProcessingResult {
  addressEnrichment?: {
    totalAddresses: number;
    validatedAddresses: number;
    geocodedAddresses: number;
    enrichedAddresses: number;
    issues: string[];
    results: AddressEnrichmentResult[];
  };
}

export class EnhancedMultiFormatProcessor {
  async processWithAddressIntelligence(
    files: File[], 
    options: EnhancedProcessingOptions = {}
  ): Promise<EnhancedProcessingResult> {
    devLog.info('Starting enhanced processing with address intelligence');
    
    // First, do the standard multi-format processing
    const baseResult = await multiFormatProcessor.processWithEnhancedAnalysis(files, options);
    
    // If address enrichment is disabled, return base result
    if (!options.enableAddressValidation && !options.enableGeocoding && !options.enablePropertyEnrichment) {
      return baseResult as EnhancedProcessingResult;
    }
    
    // Extract addresses from processed documents
    const addresses = this.extractAddressesFromDocuments(baseResult.processedDocuments, options.addressFields);
    
    if (addresses.length === 0) {
      devLog.info('No addresses found for enrichment');
      return {
        ...baseResult,
        addressEnrichment: {
          totalAddresses: 0,
          validatedAddresses: 0,
          geocodedAddresses: 0,
          enrichedAddresses: 0,
          issues: ['No addresses found in processed documents'],
          results: []
        }
      };
    }
    
    // Perform address enrichment
    try {
      const enrichmentResults = await addressEnrichmentService.enrichAddresses(addresses);
      
      // Update processed documents with enriched address data
      this.updateDocumentsWithAddressData(baseResult.processedDocuments, enrichmentResults, options.addressFields);
      
      // Calculate statistics
      const stats = this.calculateAddressStats(enrichmentResults);
      
      const enhancedResult: EnhancedProcessingResult = {
        ...baseResult,
        addressEnrichment: {
          totalAddresses: addresses.length,
          validatedAddresses: stats.validated,
          geocodedAddresses: stats.geocoded,
          enrichedAddresses: stats.enriched,
          issues: stats.issues,
          results: enrichmentResults
        }
      };
      
      // Add recommendations based on address enrichment results
      enhancedResult.recommendations.push(...this.generateAddressRecommendations(enrichmentResults));
      
      devLog.info('Enhanced processing with address intelligence completed');
      return enhancedResult;
      
    } catch (error) {
      devLog.error('Address enrichment failed during processing:', error);
      
      return {
        ...baseResult,
        addressEnrichment: {
          totalAddresses: addresses.length,
          validatedAddresses: 0,
          geocodedAddresses: 0,
          enrichedAddresses: 0,
          issues: [`Address enrichment failed: ${error instanceof Error ? error.message : 'Unknown error'}`],
          results: []
        }
      };
    }
  }
  
  private extractAddressesFromDocuments(
    documents: ProcessedDocument[], 
    addressFields?: string[]
  ): string[] {
    const addresses: string[] = [];
    const defaultAddressFields = [
      'address', 'street_address', 'property_address', 'mailing_address',
      'Address', 'Street Address', 'Property Address', 'Mailing Address'
    ];
    
    const fieldsToCheck = addressFields || defaultAddressFields;
    
    for (const doc of documents) {
      if (doc.data && Array.isArray(doc.data)) {
        for (const row of doc.data) {
          for (const field of fieldsToCheck) {
            if (row[field] && typeof row[field] === 'string' && row[field].trim().length > 10) {
              addresses.push(row[field].trim());
            }
          }
        }
      }
      
      // Also check extracted data
      if (doc.extractedData) {
        for (const field of fieldsToCheck) {
          if (doc.extractedData[field] && typeof doc.extractedData[field] === 'string') {
            addresses.push(doc.extractedData[field].trim());
          }
        }
      }
    }
    
    // Remove duplicates
    return [...new Set(addresses)];
  }
  
  private updateDocumentsWithAddressData(
    documents: ProcessedDocument[], 
    enrichmentResults: AddressEnrichmentResult[],
    addressFields?: string[]
  ): void {
    const addressMap = new Map<string, AddressEnrichmentResult>();
    
    for (const result of enrichmentResults) {
      addressMap.set(result.originalAddress, result);
    }
    
    const defaultAddressFields = [
      'address', 'street_address', 'property_address', 'mailing_address',
      'Address', 'Street Address', 'Property Address', 'Mailing Address'
    ];
    
    const fieldsToCheck = addressFields || defaultAddressFields;
    
    for (const doc of documents) {
      if (doc.data && Array.isArray(doc.data)) {
        for (const row of doc.data) {
          for (const field of fieldsToCheck) {
            if (row[field] && addressMap.has(row[field])) {
              const enrichment = addressMap.get(row[field])!;
              
              // Add enriched data to the row
              if (enrichment.enrichedData.validatedAddress?.isValid) {
                const std = enrichment.enrichedData.validatedAddress.standardizedAddress;
                row[`${field}_validated`] = `${std.street}, ${std.city}, ${std.state} ${std.zipCode}`;
                row[`${field}_validation_confidence`] = enrichment.enrichedData.confidence;
              }
              
              if (enrichment.enrichedData.coordinates) {
                row[`${field}_latitude`] = enrichment.enrichedData.coordinates.latitude;
                row[`${field}_longitude`] = enrichment.enrichedData.coordinates.longitude;
              }
              
              if (enrichment.enrichedData.propertyInfo) {
                row[`${field}_county`] = enrichment.enrichedData.propertyInfo.county;
                if (enrichment.enrichedData.propertyInfo.estimatedValue) {
                  row[`${field}_estimated_value`] = enrichment.enrichedData.propertyInfo.estimatedValue;
                }
                if (enrichment.enrichedData.propertyInfo.propertyType) {
                  row[`${field}_property_type`] = enrichment.enrichedData.propertyInfo.propertyType;
                }
              }
            }
          }
        }
      }
      
      // Update document metadata
      if (!doc.metadata.addressEnrichment) {
        doc.metadata.addressEnrichment = {
          processedAddresses: 0,
          validatedAddresses: 0,
          geocodedAddresses: 0
        };
      }
    }
  }
  
  private calculateAddressStats(results: AddressEnrichmentResult[]): {
    validated: number;
    geocoded: number;
    enriched: number;
    issues: string[];
  } {
    let validated = 0;
    let geocoded = 0;
    let enriched = 0;
    const allIssues: string[] = [];
    
    for (const result of results) {
      if (result.enrichedData.validatedAddress?.isValid) {
        validated++;
      }
      
      if (result.enrichedData.coordinates) {
        geocoded++;
      }
      
      if (result.enrichedData.propertyInfo) {
        enriched++;
      }
      
      allIssues.push(...result.issues);
    }
    
    // Get unique issues
    const uniqueIssues = [...new Set(allIssues)];
    
    return {
      validated,
      geocoded,
      enriched,
      issues: uniqueIssues
    };
  }
  
  private generateAddressRecommendations(results: AddressEnrichmentResult[]): string[] {
    const recommendations: string[] = [];
    
    const lowConfidenceCount = results.filter(r => r.enrichedData.confidence < 0.7).length;
    const invalidCount = results.filter(r => !r.enrichedData.validatedAddress?.isValid).length;
    const missingGeocodingCount = results.filter(r => !r.enrichedData.coordinates).length;
    
    if (invalidCount > 0) {
      recommendations.push(`${invalidCount} addresses could not be validated - manual review recommended`);
    }
    
    if (lowConfidenceCount > 0) {
      recommendations.push(`${lowConfidenceCount} addresses have low validation confidence - consider verification`);
    }
    
    if (missingGeocodingCount > 0) {
      recommendations.push(`${missingGeocodingCount} addresses could not be geocoded - mapping may be limited`);
    }
    
    const highQualityCount = results.filter(r => 
      r.enrichedData.validatedAddress?.isValid && 
      r.enrichedData.coordinates && 
      r.enrichedData.confidence > 0.8
    ).length;
    
    if (highQualityCount > results.length * 0.8) {
      recommendations.push(`High quality address data detected (${highQualityCount}/${results.length}) - ready for import`);
    }
    
    return recommendations;
  }
}

export const enhancedMultiFormatProcessor = new EnhancedMultiFormatProcessor();
