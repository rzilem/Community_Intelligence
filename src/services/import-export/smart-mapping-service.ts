
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
      
      // Enhanced exact matches with association code handling
      const exactMatches: Record<string, { field: string; reason: string }> = {
        'homeowner id': { field: 'homeowner_id', reason: 'Exact match for homeowner identifier' },
        'account #': { field: 'account_number', reason: 'Exact match for account number' },
        'account number': { field: 'account_number', reason: 'Exact match for account number' },
        'acct #': { field: 'account_number', reason: 'Exact match for account number' },
        'acct no': { field: 'account_number', reason: 'Exact match for account number' },
        'account no': { field: 'account_number', reason: 'Exact match for account number' },
        'property address': { field: 'address', reason: 'Exact match for property address' },
        'address': { field: 'address', reason: 'Exact match for address' },
        'unit no': { field: 'unit_number', reason: 'Exact match for unit number' },
        'unit number': { field: 'unit_number', reason: 'Exact match for unit number' },
        'unit #': { field: 'unit_number', reason: 'Exact match for unit number' },
        'city': { field: 'city', reason: 'Exact match for city' },
        'state': { field: 'state', reason: 'Exact match for state' },
        'zip': { field: 'zip', reason: 'Exact match for ZIP code' },
        'zip code': { field: 'zip', reason: 'Exact match for ZIP code' },
        'zipcode': { field: 'zip', reason: 'Exact match for ZIP code' },
        'postal code': { field: 'zip', reason: 'Exact match for ZIP code' },
        'first name': { field: 'first_name', reason: 'Exact match for first name' },
        'firstname': { field: 'first_name', reason: 'Exact match for first name' },
        'last name': { field: 'last_name', reason: 'Exact match for last name' },
        'lastname': { field: 'last_name', reason: 'Exact match for last name' },
        'second owner first name': { field: 'second_owner_first_name', reason: 'Exact match for second owner first name' },
        'second owner last name': { field: 'second_owner_last_name', reason: 'Exact match for second owner last name' },
        'co-owner first name': { field: 'second_owner_first_name', reason: 'Exact match for second owner first name' },
        'co-owner last name': { field: 'second_owner_last_name', reason: 'Exact match for second owner last name' },
        'email': { field: 'email', reason: 'Exact match for email' },
        'email address': { field: 'email', reason: 'Exact match for email' },
        'phone': { field: 'phone', reason: 'Exact match for phone' },
        'phone number': { field: 'phone', reason: 'Exact match for phone' },
        'telephone': { field: 'phone', reason: 'Exact match for phone' },
        'settled date': { field: 'move_in_date', reason: 'Exact match for move-in date' },
        'move in date': { field: 'move_in_date', reason: 'Exact match for move-in date' },
        'move-in date': { field: 'move_in_date', reason: 'Exact match for move-in date' },
        'movein date': { field: 'move_in_date', reason: 'Exact match for move-in date' },
        'balance': { field: 'balance', reason: 'Exact match for balance' },
        'current balance': { field: 'balance', reason: 'Exact match for balance' },
        'outstanding balance': { field: 'balance', reason: 'Exact match for balance' },
        'collection status': { field: 'collection_status', reason: 'Exact match for collection status' },
        'collections status': { field: 'collection_status', reason: 'Exact match for collection status' },
        'business name': { field: 'business_name', reason: 'Exact match for business name' },
        'company name': { field: 'business_name', reason: 'Exact match for business name' },
        'deed name': { field: 'deed_name', reason: 'Exact match for deed name' },
        'legal name': { field: 'deed_name', reason: 'Exact match for deed name' },
        'mailing address': { field: 'mailing_address', reason: 'Exact match for mailing address' },
        'mail address': { field: 'mailing_address', reason: 'Exact match for mailing address' },
        'lot no': { field: 'lot_number', reason: 'Exact match for lot number' },
        'lot number': { field: 'lot_number', reason: 'Exact match for lot number' },
        'lot #': { field: 'lot_number', reason: 'Exact match for lot number' },
        'block no': { field: 'block_number', reason: 'Exact match for block number' },
        'block number': { field: 'block_number', reason: 'Exact match for block number' },
        'block #': { field: 'block_number', reason: 'Exact match for block number' },
        'phase': { field: 'phase', reason: 'Exact match for phase' },
        'village': { field: 'village', reason: 'Exact match for village' },
        'legal description': { field: 'legal_description', reason: 'Exact match for legal description' },
        'parcel id': { field: 'parcel_id', reason: 'Exact match for parcel ID' },
        'parcel number': { field: 'parcel_id', reason: 'Exact match for parcel ID' },
        'property type': { field: 'property_type', reason: 'Exact match for property type' },
        'type': { field: 'property_type', reason: 'Match for property type' },
        'square feet': { field: 'square_feet', reason: 'Exact match for square footage' },
        'sq ft': { field: 'square_feet', reason: 'Exact match for square footage' },
        'sqft': { field: 'square_feet', reason: 'Exact match for square footage' },
        'bedrooms': { field: 'bedrooms', reason: 'Exact match for bedrooms' },
        'beds': { field: 'bedrooms', reason: 'Exact match for bedrooms' },
        'bathrooms': { field: 'bathrooms', reason: 'Exact match for bathrooms' },
        'baths': { field: 'bathrooms', reason: 'Exact match for bathrooms' },
        // Association identifier patterns - enhanced for association codes
        'association id': { field: 'association_identifier', reason: 'Exact match for association identifier' },
        'association code': { field: 'association_identifier', reason: 'Association code maps to identifier' },
        'association name': { field: 'association_identifier', reason: 'Association name maps to identifier' },
        'hoa id': { field: 'association_identifier', reason: 'HOA ID maps to association identifier' },
        'hoa code': { field: 'association_identifier', reason: 'HOA code maps to association identifier' },
        'hoa name': { field: 'association_identifier', reason: 'HOA name maps to identifier' },
        'community code': { field: 'association_identifier', reason: 'Community code maps to identifier' },
        'community id': { field: 'association_identifier', reason: 'Community ID maps to identifier' },
        'code': { field: 'association_identifier', reason: 'Code likely maps to association identifier' }
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
      
      // Enhanced pattern matching for association codes in account numbers
      if (!bestMatch && (lowerColumn.includes('account') || lowerColumn.includes('acct'))) {
        // Check if this might be an account number that contains association codes
        const associationField = systemFields.find(field => field.value === 'account_number');
        if (associationField && !usedFields.has(associationField.value)) {
          bestMatch = {
            fieldValue: associationField.value,
            confidence: 0.9,
            reason: 'Account number field (may contain association codes like TLC-, SOC-, etc.)'
          };
        }
      }
      
      // If no exact match, try fuzzy matching with enhanced association code detection
      if (!bestMatch) {
        systemFields.forEach(field => {
          // Skip if field is already used
          if (usedFields.has(field.value)) return;
          
          const fieldLower = field.label.toLowerCase();
          const fieldValueLower = field.value.toLowerCase();
          
          let confidence = 0;
          let reason = '';
          
          // Enhanced exact match on label or value
          if (fieldLower === lowerColumn || fieldValueLower === lowerColumn) {
            confidence = 0.9;
            reason = `Exact match with ${field.label}`;
          }
          // Enhanced contains match with special handling for association identifiers
          else if (fieldLower.includes(lowerColumn) || lowerColumn.includes(fieldLower)) {
            confidence = 0.7;
            reason = `Partial match with ${field.label}`;
            
            // Boost confidence for association-related matches
            if (field.value === 'association_identifier' && 
                (lowerColumn.includes('association') || lowerColumn.includes('hoa') || 
                 lowerColumn.includes('community') || lowerColumn.includes('code'))) {
              confidence = 0.85;
              reason = `Strong association identifier match with ${field.label}`;
            }
          }
          // Enhanced word-based matching
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
              
              // Special boost for association-related terms
              if (field.value === 'association_identifier' && 
                  matchingWords.some(word => ['association', 'hoa', 'community', 'code'].includes(word))) {
                confidence = Math.min(confidence + 0.2, 0.8);
                reason = `Enhanced association match: ${matchingWords.join(', ')}`;
              }
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
