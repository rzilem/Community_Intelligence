
import { MappingOption } from '@/components/data-import/types/mapping-types';

interface MappingSuggestion {
  fieldValue: string;
  confidence: number;
}

export const aiMappingService = {
  generateMappingSuggestions: (
    fileColumns: string[],
    systemFields: MappingOption[],
    sampleData: any[]
  ): Record<string, MappingSuggestion> => {
    const suggestions: Record<string, MappingSuggestion> = {};
    
    fileColumns.forEach(column => {
      const lowerColumn = column.toLowerCase().trim();
      let bestMatch: MappingSuggestion | null = null;
      
      // Define exact matches with high confidence
      const exactMatches: Record<string, string> = {
        'homeowner id': 'homeowner_id',
        'account #': 'account_number',
        'account number': 'account_number',
        'property address': 'address',
        'address': 'address',
        'unit no': 'unit_number',
        'unit number': 'unit_number',
        'city': 'city',
        'state': 'state',
        'zip': 'zip',
        'first name': 'first_name',
        'last name': 'last_name',
        'second owner first name': 'second_owner_first_name',
        'second owner last name': 'second_owner_last_name',
        'email': 'email',
        'phone': 'phone',
        'settled date': 'move_in_date',
        'balance': 'Balance',
        'collection status': 'Collection Status',
        'business name': 'Business Name',
        'deed name': 'Deed Name',
        'mailing address': 'Mailing Address',
        'lot no': 'Lot No',
        'block no': 'Block No',
        'phase': 'Phase',
        'village': 'Village',
        'legal description': 'Legal Description',
        'parcel id': 'Parcel ID',
        'association id': 'association_identifier',
        'association name': 'association_identifier',
        'association code': 'association_identifier',
        'hoa id': 'association_identifier',
        'hoa name': 'association_identifier'
      };
      
      // Check for exact matches first
      if (exactMatches[lowerColumn]) {
        const matchingField = systemFields.find(field => 
          field.value === exactMatches[lowerColumn] || 
          field.label.toLowerCase() === exactMatches[lowerColumn].toLowerCase()
        );
        
        if (matchingField) {
          bestMatch = {
            fieldValue: matchingField.value,
            confidence: 0.95
          };
        }
      }
      
      // If no exact match, try fuzzy matching
      if (!bestMatch) {
        systemFields.forEach(field => {
          const fieldLower = field.label.toLowerCase();
          const fieldValueLower = field.value.toLowerCase();
          
          let confidence = 0;
          
          // Exact match on label or value
          if (fieldLower === lowerColumn || fieldValueLower === lowerColumn) {
            confidence = 0.9;
          }
          // Contains match
          else if (fieldLower.includes(lowerColumn) || lowerColumn.includes(fieldLower)) {
            confidence = 0.7;
          }
          // Partial word match
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
            }
          }
          
          if (confidence > (bestMatch?.confidence || 0)) {
            bestMatch = {
              fieldValue: field.value,
              confidence
            };
          }
        });
      }
      
      if (bestMatch && bestMatch.confidence > 0.5) {
        suggestions[column] = bestMatch;
      }
    });
    
    return suggestions;
  }
};
