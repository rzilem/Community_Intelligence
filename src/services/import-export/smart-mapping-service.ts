
import { MappingOption } from '@/components/data-import/types/mapping-types';

interface SmartMappingSuggestion {
  fieldValue: string;
  confidence: number;
  reason: string;
}

export const smartMappingService = {
  generateSmartMappings: (
    fileColumns: string[],
    systemFields: MappingOption[],
    sampleData: any[]
  ): Record<string, SmartMappingSuggestion> => {
    const suggestions: Record<string, SmartMappingSuggestion> = {};
    const usedFields = new Set<string>();
    
    // Sort columns by priority - exact matches first, then partial matches
    const sortedColumns = [...fileColumns].sort((a, b) => {
      const aExact = hasExactMatch(a, systemFields);
      const bExact = hasExactMatch(b, systemFields);
      if (aExact && !bExact) return -1;
      if (!aExact && bExact) return 1;
      return 0;
    });
    
    sortedColumns.forEach(column => {
      const lowerColumn = column.toLowerCase().trim();
      let bestMatch: SmartMappingSuggestion | null = null;
      
      // Define exact matches with high confidence
      const exactMatches: Record<string, { field: string; reason: string }> = {
        'homeowner id': { field: 'homeowner_id', reason: 'Exact match for homeowner identifier' },
        'account #': { field: 'account_number', reason: 'Exact match for account number' },
        'account number': { field: 'account_number', reason: 'Exact match for account number' },
        'property address': { field: 'address', reason: 'Exact match for property address' },
        'address': { field: 'address', reason: 'Exact match for address' },
        'unit no': { field: 'unit_number', reason: 'Exact match for unit number' },
        'unit number': { field: 'unit_number', reason: 'Exact match for unit number' },
        'city': { field: 'city', reason: 'Exact match for city' },
        'state': { field: 'state', reason: 'Exact match for state' },
        'zip': { field: 'zip', reason: 'Exact match for ZIP code' },
        'zip code': { field: 'zip', reason: 'Exact match for ZIP code' },
        'first name': { field: 'first_name', reason: 'Exact match for first name' },
        'last name': { field: 'last_name', reason: 'Exact match for last name' },
        'second owner first name': { field: 'second_owner_first_name', reason: 'Exact match for second owner first name' },
        'second owner last name': { field: 'second_owner_last_name', reason: 'Exact match for second owner last name' },
        'email': { field: 'email', reason: 'Exact match for email' },
        'phone': { field: 'phone', reason: 'Exact match for phone' },
        'settled date': { field: 'move_in_date', reason: 'Exact match for move-in date' },
        'move in date': { field: 'move_in_date', reason: 'Exact match for move-in date' },
        'balance': { field: 'balance', reason: 'Exact match for balance' },
        'collection status': { field: 'collection_status', reason: 'Exact match for collection status' },
        'business name': { field: 'business_name', reason: 'Exact match for business name' },
        'deed name': { field: 'deed_name', reason: 'Exact match for deed name' },
        'mailing address': { field: 'mailing_address', reason: 'Exact match for mailing address' },
        'lot no': { field: 'lot_number', reason: 'Exact match for lot number' },
        'lot number': { field: 'lot_number', reason: 'Exact match for lot number' },
        'block no': { field: 'block_number', reason: 'Exact match for block number' },
        'block number': { field: 'block_number', reason: 'Exact match for block number' },
        'phase': { field: 'phase', reason: 'Exact match for phase' },
        'village': { field: 'village', reason: 'Exact match for village' },
        'legal description': { field: 'legal_description', reason: 'Exact match for legal description' },
        'parcel id': { field: 'parcel_id', reason: 'Exact match for parcel ID' },
        'property type': { field: 'property_type', reason: 'Exact match for property type' },
        'square feet': { field: 'square_feet', reason: 'Exact match for square footage' },
        'bedrooms': { field: 'bedrooms', reason: 'Exact match for bedrooms' },
        'bathrooms': { field: 'bathrooms', reason: 'Exact match for bathrooms' },
        'association id': { field: 'association_identifier', reason: 'Exact match for association identifier' },
        'association name': { field: 'association_identifier', reason: 'Association name maps to identifier' },
        'hoa id': { field: 'association_identifier', reason: 'HOA ID maps to association identifier' },
        'hoa name': { field: 'association_identifier', reason: 'HOA name maps to association identifier' }
      };
      
      // Check for exact matches first
      if (exactMatches[lowerColumn]) {
        const match = exactMatches[lowerColumn];
        const matchingField = systemFields.find(field => field.value === match.field);
        
        if (matchingField && !usedFields.has(matchingField.value)) {
          bestMatch = {
            fieldValue: matchingField.value,
            confidence: 0.95,
            reason: match.reason
          };
        }
      }
      
      // If no exact match, try fuzzy matching
      if (!bestMatch) {
        systemFields.forEach(field => {
          // Skip if field is already used
          if (usedFields.has(field.value)) return;
          
          const fieldLower = field.label.toLowerCase();
          const fieldValueLower = field.value.toLowerCase();
          
          let confidence = 0;
          let reason = '';
          
          // Exact match on label or value
          if (fieldLower === lowerColumn || fieldValueLower === lowerColumn) {
            confidence = 0.9;
            reason = `Exact match with ${field.label}`;
          }
          // Contains match
          else if (fieldLower.includes(lowerColumn) || lowerColumn.includes(fieldLower)) {
            confidence = 0.7;
            reason = `Partial match with ${field.label}`;
          }
          // Word-based matching
          else {
            const columnWords = lowerColumn.split(/[\s_-]+/);
            const fieldWords = fieldLower.split(/[\s_-]+/);
            
            const matchingWords = columnWords.filter(word => 
              fieldWords.some(fieldWord => 
                fieldWord.includes(word) || word.includes(fieldWord)
              )
            );
            
            if (matchingWords.length > 0) {
              confidence = (matchingWords.length / Math.max(columnWords.length, fieldWords.length)) * 0.6;
              reason = `Word match: ${matchingWords.join(', ')} with ${field.label}`;
            }
          }
          
          if (confidence > (bestMatch?.confidence || 0)) {
            bestMatch = {
              fieldValue: field.value,
              confidence,
              reason
            };
          }
        });
      }
      
      // Only add suggestion if confidence is high enough and field not already used
      if (bestMatch && bestMatch.confidence > 0.5 && !usedFields.has(bestMatch.fieldValue)) {
        suggestions[column] = bestMatch;
        usedFields.add(bestMatch.fieldValue);
        console.log(`Smart mapping: "${column}" -> "${bestMatch.fieldValue}" (${bestMatch.confidence.toFixed(2)} confidence, ${bestMatch.reason})`);
      }
    });
    
    return suggestions;
  }
};

// Helper function to check if a column has an exact match
function hasExactMatch(column: string, systemFields: MappingOption[]): boolean {
  const lowerColumn = column.toLowerCase().trim();
  return systemFields.some(field => 
    field.label.toLowerCase() === lowerColumn || 
    field.value.toLowerCase() === lowerColumn
  );
}
