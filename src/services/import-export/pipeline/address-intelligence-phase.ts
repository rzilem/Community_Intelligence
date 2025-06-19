
import { ProcessingPhase } from './processing-phase';
import { ProcessedDocument, EnhancedProcessingOptions } from '../types';
import { addressEnrichmentService } from '../address-enrichment-service';
import { devLog } from '@/utils/dev-logger';

export class AddressIntelligencePhase extends ProcessingPhase {
  getName(): string {
    return 'Address Intelligence';
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
          
          const enrichmentResults = await addressEnrichmentService.enrichAddresses(addresses);
          doc.metadata.addressEnrichment = enrichmentResults;
          
          if (enrichmentResults.some(r => r.issues.length > 0)) {
            doc.metadata.addressEnrichment.push({
              originalAddress: 'SYSTEM_RECOMMENDATION',
              enrichedData: { confidence: 1.0 },
              issues: [],
              suggestions: ['Some addresses require manual review for accuracy']
            });
          }
        }
      } catch (error) {
        devLog.error('Address intelligence failed for document:', doc.filename, error);
      }
    }
    
    this.logPhaseComplete();
  }

  private extractAddressesFromContent(content: string): string[] {
    const addresses: string[] = [];
    const addressPatterns = [
      /\b\d+\s+[A-Za-z\s]+(?:Street|St|Avenue|Ave|Road|Rd|Drive|Dr|Lane|Ln|Boulevard|Blvd|Circle|Cir|Way|Court|Ct)\b/gi,
      /\b\d+\s+[A-Za-z\s]+\s+(?:Street|St|Avenue|Ave|Road|Rd|Drive|Dr|Lane|Ln|Boulevard|Blvd|Circle|Cir|Way|Court|Ct)\s*,?\s*[A-Za-z\s]+\s*,?\s*[A-Z]{2}\s*\d{5}/gi
    ];
    
    for (const pattern of addressPatterns) {
      const matches = content.match(pattern);
      if (matches) {
        addresses.push(...matches);
      }
    }
    
    return [...new Set(addresses)];
  }
}
