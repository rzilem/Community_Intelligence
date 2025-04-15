
/**
 * Service for AI-powered mapping suggestions
 */
export const aiMappingService = {
  generateMappingSuggestions: (
    fileColumns: string[],
    systemFields: { label: string; value: string }[],
    sampleData: any[]
  ): Record<string, { fieldValue: string; confidence: number }> => {
    const suggestions: Record<string, { fieldValue: string; confidence: number }> = {};
    
    if (!fileColumns.length || !systemFields.length || !sampleData.length) {
      console.log("Missing data required for generating suggestions");
      return suggestions;
    }
    
    console.log("Generating mapping suggestions for", fileColumns.length, "columns");
    
    // Special case handlers for common fields
    const specialCaseHandler = (
      column: string
    ): { field: string; confidence: number } | null => {
      const lowerColumn = column.toLowerCase();
      
      // Handle address fields
      if (['address', 'street_address', 'street', 'property_address'].includes(lowerColumn)) {
        const addressField = systemFields.find(f => 
          f.value === 'address' || 
          f.value === 'property.address'
        );
        if (addressField) return { field: addressField.value, confidence: 0.95 };
      }
      
      // Handle city field
      if (['city', 'town', 'municipality'].includes(lowerColumn)) {
        const cityField = systemFields.find(f => 
          f.value === 'city' || 
          f.value === 'property.city'
        );
        if (cityField) return { field: cityField.value, confidence: 0.95 };
      }
      
      // Handle state field
      if (['state', 'province', 'region'].includes(lowerColumn)) {
        const stateField = systemFields.find(f => 
          f.value === 'state' || 
          f.value === 'property.state'
        );
        if (stateField) return { field: stateField.value, confidence: 0.95 };
      }
      
      // Handle zip code field
      if (['zip', 'zipcode', 'postal_code', 'postal'].includes(lowerColumn)) {
        const zipField = systemFields.find(f => 
          f.value === 'zip' || 
          f.value === 'property.zip'
        );
        if (zipField) return { field: zipField.value, confidence: 0.95 };
      }
      
      // Handle name fields
      if (['first_name', 'firstname', 'first'].includes(lowerColumn)) {
        const firstNameField = systemFields.find(f => 
          f.value === 'first_name' || 
          f.value === 'owner.first_name'
        );
        if (firstNameField) return { field: firstNameField.value, confidence: 0.95 };
      }
      
      if (['last_name', 'lastname', 'last', 'surname'].includes(lowerColumn)) {
        const lastNameField = systemFields.find(f => 
          f.value === 'last_name' || 
          f.value === 'owner.last_name'
        );
        if (lastNameField) return { field: lastNameField.value, confidence: 0.95 };
      }
      
      // Handle email
      if (['email', 'email_address', 'mail'].includes(lowerColumn)) {
        const emailField = systemFields.find(f => 
          f.value === 'email' || 
          f.value === 'owner.email' ||
          f.value === 'contact_email'
        );
        if (emailField) return { field: emailField.value, confidence: 0.95 };
      }
      
      // Handle phone
      if (['phone', 'phone_number', 'telephone', 'contact_number'].includes(lowerColumn)) {
        const phoneField = systemFields.find(f => 
          f.value === 'phone' || 
          f.value === 'owner.phone'
        );
        if (phoneField) return { field: phoneField.value, confidence: 0.95 };
      }
      
      // Handle boolean fields (is_primary)
      if (['is_primary', 'primary', 'co_owner_is_primary', 'is_primary_owner'].includes(lowerColumn)) {
        const primaryField = systemFields.find(f => 
          f.value === 'is_primary' || 
          f.value === 'owner.is_primary'
        );
        if (primaryField) return { field: primaryField.value, confidence: 0.95 };
      }
      
      return null;
    };

    // For each file column, find the best matching system field
    for (const column of fileColumns) {
      // First try special case handler
      const specialCase = specialCaseHandler(column);
      if (specialCase) {
        suggestions[column] = {
          fieldValue: specialCase.field,
          confidence: specialCase.confidence
        };
        continue;
      }
      
      // Calculate semantic similarity for each system field
      const lowerColumn = column.toLowerCase();
      let bestMatch = null;
      let highestScore = 0;
      
      for (const field of systemFields) {
        // Get field name without parent object (e.g. "property.address" -> "address")
        const fieldName = field.value.split('.').pop() || field.value;
        const fieldLabel = field.label.toLowerCase();
        
        // Calculate simple similarity score
        let score = 0;
        
        // Exact match
        if (lowerColumn === fieldName) {
          score = 1.0;
        }
        // Field name is contained in column name
        else if (lowerColumn.includes(fieldName)) {
          score = 0.9;
        }
        // Column name is contained in field name
        else if (fieldName.includes(lowerColumn)) {
          score = 0.8;
        }
        // Column name is similar to field label
        else if (fieldLabel.includes(lowerColumn) || lowerColumn.includes(fieldLabel)) {
          score = 0.7;
        }
        // Check for partial matches after removing non-alphanumeric chars
        else {
          const cleanColumn = lowerColumn.replace(/[^a-z0-9]/gi, '');
          const cleanField = fieldName.replace(/[^a-z0-9]/gi, '');
          
          if (cleanColumn === cleanField) {
            score = 0.6;
          } else if (cleanColumn.includes(cleanField) || cleanField.includes(cleanColumn)) {
            score = 0.5;
          }
        }
        
        if (score > highestScore) {
          highestScore = score;
          bestMatch = field.value;
        }
      }
      
      if (bestMatch && highestScore > 0.4) {
        suggestions[column] = {
          fieldValue: bestMatch,
          confidence: highestScore
        };
      }
    }
    
    console.log("Generated mapping suggestions:", suggestions);
    return suggestions;
  }
};
