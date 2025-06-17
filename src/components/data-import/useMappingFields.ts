
import { useState, useEffect } from 'react';

interface MappingOption {
  label: string;
  value: string;
}

export function useMappingFields(importType: string, fileData: any[], associationId: string) {
  const [fileColumns, setFileColumns] = useState<string[]>([]);
  const [systemFields, setSystemFields] = useState<MappingOption[]>([]);
  const [previewData, setPreviewData] = useState<any[]>([]);

  useEffect(() => {
    console.log('useMappingFields: Processing file data:', {
      fileDataLength: fileData?.length,
      fileDataSample: fileData?.slice(0, 2),
      importType,
      associationId
    });

    if (fileData && fileData.length > 0) {
      // Extract column names from the first row with multiple fallback strategies
      const firstRow = fileData[0];
      let columns: string[] = [];
      
      console.log('useMappingFields: First row analysis:', {
        firstRow,
        typeof: typeof firstRow,
        isObject: typeof firstRow === 'object',
        isArray: Array.isArray(firstRow),
        keys: firstRow ? Object.keys(firstRow) : 'no keys'
      });
      
      if (firstRow && typeof firstRow === 'object' && !Array.isArray(firstRow)) {
        // Standard object-based CSV parsing
        columns = Object.keys(firstRow);
        console.log('useMappingFields: Extracted columns from object keys:', columns);
      } else if (Array.isArray(firstRow)) {
        // Array-based CSV parsing - use indices as column names or look for header row
        columns = firstRow.map((_, index) => `Column ${index + 1}`);
        console.log('useMappingFields: Extracted columns from array indices:', columns);
      } else {
        // Fallback: try to extract from all rows to find common keys
        const allKeys = new Set<string>();
        fileData.forEach(row => {
          if (row && typeof row === 'object') {
            Object.keys(row).forEach(key => allKeys.add(key));
          }
        });
        columns = Array.from(allKeys);
        console.log('useMappingFields: Extracted columns from all rows:', columns);
      }
      
      // Filter out empty or undefined column names
      columns = columns.filter(col => col && col.trim() !== '');
      
      console.log('useMappingFields: Final extracted columns:', columns);
      setFileColumns(columns);
      
      // Set preview data (first 5 rows)
      setPreviewData(fileData.slice(0, 5));
    } else {
      console.log('useMappingFields: No file data available');
      setFileColumns([]);
      setPreviewData([]);
    }
  }, [fileData]);

  useEffect(() => {
    console.log('useMappingFields: Generating system fields for:', {
      importType,
      associationId,
      isMultiAssociation: associationId === 'all'
    });

    // Define system fields based on import type
    const getSystemFields = (type: string): MappingOption[] => {
      const baseFields = getBaseFieldsForType(type);
      
      // Add association identifier field for multi-association imports
      if (associationId === 'all' && type !== 'associations') {
        const fieldsWithAssociation = [
          { label: 'Association Identifier', value: 'association_identifier' },
          ...baseFields
        ];
        console.log('useMappingFields: Added association identifier, total fields:', fieldsWithAssociation.length);
        return fieldsWithAssociation;
      }
      
      console.log('useMappingFields: Using base fields only, total:', baseFields.length);
      return baseFields;
    };

    const getBaseFieldsForType = (type: string): MappingOption[] => {
      switch (type) {
        case 'properties':
          return [
            { label: 'Property Address', value: 'address' },
            { label: 'Property Type', value: 'property_type' },
            { label: 'Unit Number', value: 'unit_number' },
            { label: 'City', value: 'city' },
            { label: 'State', value: 'state' },
            { label: 'ZIP Code', value: 'zip' },
            { label: 'Square Feet', value: 'square_feet' },
            { label: 'Bedrooms', value: 'bedrooms' },
            { label: 'Bathrooms', value: 'bathrooms' },
            { label: 'Account Number', value: 'account_number' },
            { label: 'Homeowner ID', value: 'homeowner_id' }
          ];
        
        case 'owners':
        case 'residents':
          return [
            { label: 'First Name', value: 'first_name' },
            { label: 'Last Name', value: 'last_name' },
            { label: 'Full Name', value: 'name' },
            { label: 'Email', value: 'email' },
            { label: 'Phone', value: 'phone' },
            { label: 'Property ID', value: 'property_id' },
            { label: 'Resident Type', value: 'resident_type' },
            { label: 'Is Primary', value: 'is_primary' },
            { label: 'Move In Date', value: 'move_in_date' },
            { label: 'Emergency Contact', value: 'emergency_contact' },
            { label: 'Account Number', value: 'account_number' }
          ];
        
        case 'properties_owners':
          return [
            // Property fields
            { label: 'Property Address', value: 'address' },
            { label: 'Property Type', value: 'property_type' },
            { label: 'Unit Number', value: 'unit_number' },
            { label: 'City', value: 'city' },
            { label: 'State', value: 'state' },
            { label: 'ZIP Code', value: 'zip' },
            { label: 'Square Feet', value: 'square_feet' },
            { label: 'Bedrooms', value: 'bedrooms' },
            { label: 'Bathrooms', value: 'bathrooms' },
            { label: 'Account Number', value: 'account_number' },
            { label: 'Homeowner ID', value: 'homeowner_id' },
            
            // Primary owner fields
            { label: 'First Name', value: 'first_name' },
            { label: 'Last Name', value: 'last_name' },
            { label: 'Email', value: 'email' },
            { label: 'Phone', value: 'phone' },
            { label: 'Move In Date', value: 'move_in_date' },
            { label: 'Emergency Contact', value: 'emergency_contact' },
            
            // Second owner fields
            { label: 'Second Owner First Name', value: 'second_owner_first_name' },
            { label: 'Second Owner Last Name', value: 'second_owner_last_name' },
            
            // Additional fields
            { label: 'Business Name', value: 'business_name' },
            { label: 'Deed Name', value: 'deed_name' },
            { label: 'Mailing Address', value: 'mailing_address' },
            { label: 'Lot Number', value: 'lot_number' },
            { label: 'Block Number', value: 'block_number' },
            { label: 'Phase', value: 'phase' },
            { label: 'Village', value: 'village' },
            { label: 'Legal Description', value: 'legal_description' },
            { label: 'Parcel ID', value: 'parcel_id' },
            { label: 'Balance', value: 'balance' },
            { label: 'Collection Status', value: 'collection_status' }
          ];
        
        case 'financial':
          return [
            { label: 'Property Address', value: 'address' },
            { label: 'Property ID', value: 'property_id' },
            { label: 'Amount', value: 'amount' },
            { label: 'Due Date', value: 'due_date' },
            { label: 'Description', value: 'description' },
            { label: 'Account Number', value: 'account_number' }
          ];
        
        case 'compliance':
          return [
            { label: 'Property Address', value: 'address' },
            { label: 'Property ID', value: 'property_id' },
            { label: 'Violation Type', value: 'violation_type' },
            { label: 'Description', value: 'description' },
            { label: 'Fine Amount', value: 'fine_amount' },
            { label: 'Due Date', value: 'due_date' },
            { label: 'Account Number', value: 'account_number' }
          ];
        
        case 'maintenance':
          return [
            { label: 'Property Address', value: 'address' },
            { label: 'Property ID', value: 'property_id' },
            { label: 'Title', value: 'title' },
            { label: 'Description', value: 'description' },
            { label: 'Priority', value: 'priority' },
            { label: 'Status', value: 'status' },
            { label: 'Account Number', value: 'account_number' }
          ];
        
        case 'associations':
          return [
            { label: 'Association Name', value: 'name' },
            { label: 'Address', value: 'address' },
            { label: 'City', value: 'city' },
            { label: 'State', value: 'state' },
            { label: 'ZIP Code', value: 'zip' },
            { label: 'Phone', value: 'phone' },
            { label: 'Contact Email', value: 'contact_email' }
          ];
        
        case 'vendors':
          return [
            { label: 'Vendor Name', value: 'name' },
            { label: 'Contact Person', value: 'contact_person' },
            { label: 'Email', value: 'email' },
            { label: 'Phone', value: 'phone' },
            { label: 'Category', value: 'category' },
            { label: 'Status', value: 'status' },
            { label: 'Has Insurance', value: 'has_insurance' }
          ];
        
        default:
          console.log('useMappingFields: Unknown import type:', type);
          return [];
      }
    };

    const fields = getSystemFields(importType);
    console.log('useMappingFields: Generated system fields:', fields);
    setSystemFields(fields);
  }, [importType, associationId]);

  console.log('useMappingFields: Final state:', {
    fileColumnsCount: fileColumns.length,
    systemFieldsCount: systemFields.length,
    previewDataCount: previewData.length,
    fileColumns,
    systemFieldsSample: systemFields.slice(0, 3)
  });

  return {
    fileColumns,
    systemFields,
    previewData
  };
}
