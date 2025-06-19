
import { ProcessingPhase } from './processing-phase';
import { ProcessedDocument, EnhancedProcessingOptions } from '../types';
import { addressIntelligenceService } from '../address-intelligence-service';
import { devLog } from '@/utils/dev-logger';

export class AddressIntelligencePhase extends ProcessingPhase {
  getName(): string {
    return 'Advanced Address Intelligence';
  }

  isEnabled(options: EnhancedProcessingOptions): boolean {
    return !!options.addressIntelligence?.enableValidation;
  }

  async execute(documents: ProcessedDocument[], options: EnhancedProcessingOptions): Promise<void> {
    this.logPhaseStart(documents.length);
    
    for (const doc of documents) {
      try {
        const addresses = this.extractAddressesFromContent(doc.content);
        
        if (addresses.length > 0) {
          devLog.info(`Found ${addresses.length} addresses in ${doc.filename}`);
          
          // Use real address intelligence service
          const enrichmentResults = await Promise.all(
            addresses.map(async (address) => {
              const validation = await addressIntelligenceService.validateAddress(address);
              const propertyInfo = await addressIntelligenceService.getPropertyInfo(address);
              
              return {
                originalAddress: address,
                enrichedData: {
                  validatedAddress: validation,
                  coordinates: validation.geocoding ? {
                    latitude: validation.geocoding.latitude,
                    longitude: validation.geocoding.longitude
                  } : undefined,
                  propertyInfo: propertyInfo ? {
                    county: propertyInfo.county,
                    estimatedValue: propertyInfo.estimatedValue,
                    propertyType: propertyInfo.propertyType
                  } : undefined,
                  confidence: validation.confidence
                },
                issues: validation.isValid ? [] : ['Address validation failed'],
                suggestions: validation.suggestions || []
              };
            })
          );
          
          doc.metadata.addressEnrichment = enrichmentResults;
          
          // Add quality assessment based on enrichment results
          const validAddresses = enrichmentResults.filter(r => r.enrichedData.confidence > 0.7);
          if (validAddresses.length < enrichmentResults.length * 0.8) {
            doc.metadata.addressEnrichment.push({
              originalAddress: 'SYSTEM_ALERT',
              enrichedData: { confidence: 0.5 },
              issues: ['Low address validation rate - manual review recommended'],
              suggestions: ['Verify address formats and completeness']
            });
          }
        }
      } catch (error) {
        devLog.error('Address intelligence failed for document:', doc.filename, error);
        // Add error information to document metadata
        if (!doc.metadata.addressEnrichment) {
          doc.metadata.addressEnrichment = [];
        }
        doc.metadata.addressEnrichment.push({
          originalAddress: 'ERROR',
          enrichedData: { confidence: 0 },
          issues: [`Address processing error: ${error instanceof Error ? error.message : 'Unknown error'}`],
          suggestions: ['Manual address review required']
        });
      }
    }
    
    this.logPhaseComplete();
  }

  private extractAddressesFromContent(content: string): string[] {
    const addresses: string[] = [];
    
    // Enhanced address extraction patterns
    const addressPatterns = [
      // Standard US addresses
      /\b\d+\s+[A-Za-z\s]+(?:Street|St|Avenue|Ave|Road|Rd|Drive|Dr|Lane|Ln|Boulevard|Blvd|Circle|Cir|Way|Court|Ct|Place|Pl|Terrace|Ter|Parkway|Pkwy)\b[,\s]*[A-Za-z\s]*[,\s]*[A-Z]{2}\s*\d{5}(?:-\d{4})?\b/gi,
      
      // Address with unit numbers
      /\b\d+\s+[A-Za-z\s]+(?:Street|St|Avenue|Ave|Road|Rd|Drive|Dr|Lane|Ln|Boulevard|Blvd|Circle|Cir|Way|Court|Ct|Place|Pl|Terrace|Ter|Parkway|Pkwy)\s*(?:Unit|Apt|Apartment|Suite|Ste)\s*[A-Za-z0-9]+\b/gi,
      
      // Simple street addresses
      /\b\d+\s+[A-Za-z\s]+(?:Street|St|Avenue|Ave|Road|Rd|Drive|Dr|Lane|Ln|Boulevard|Blvd|Circle|Cir|Way|Court|Ct)\b/gi
    ];
    
    for (const pattern of addressPatterns) {
      const matches = content.match(pattern);
      if (matches) {
        addresses.push(...matches);
      }
    }
    
    // Remove duplicates and clean up
    const uniqueAddresses = [...new Set(addresses)].map(addr => addr.trim());
    
    // Filter out obvious false positives
    return uniqueAddresses.filter(addr => {
      // Must have at least a number and a street name
      return /\d+\s+[A-Za-z]+/.test(addr) && addr.length > 10;
    });
  }
}
