
import { useState, useEffect } from 'react';

interface MappingOption {
  label: string;
  value: string;
}

export function useMappingFields(importType: string, fileData: any[], associationId: string) {
  const [fileColumns, setFileColumns] = useState<string[]>([]);
  const [systemFields, setSystemFields] = useState<MappingOption[]>([]);
  const [mappings, setMappings] = useState<Record<string, string>>({});
  const [previewData, setPreviewData] = useState<any[]>([]);

  useEffect(() => {
    if (fileData && fileData.length > 0) {
      // Extract column names from the first row
      const columns = Object.keys(fileData[0]);
      setFileColumns(columns);
      
      // Set preview data (first 5 rows)
      setPreviewData(fileData.slice(0, 5));
    }
  }, [fileData]);

  useEffect(() => {
    // Define system fields based on import type
    const getSystemFields = (type: string): MappingOption[] => {
      switch (type) {
        case 'properties':
          return [
            { label: 'Property Address', value: 'address' },
            { label: 'Unit Number', value: 'unit_number' },
            { label: 'Property Type', value: 'property_type' },
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
            { label: 'Property Address (Alt)', value: 'Property Address' },
            { label: 'Unit Number', value: 'unit_number' },
            { label: 'Unit Number (Alt)', value: 'Unit No' },
            { label: 'Property Type', value: 'property_type' },
            { label: 'City', value: 'city' },
            { label: 'City (Alt)', value: 'City' },
            { label: 'State', value: 'state' },
            { label: 'State (Alt)', value: 'State' },
            { label: 'ZIP Code', value: 'zip' },
            { label: 'ZIP Code (Alt)', value: 'Zip' },
            { label: 'Square Feet', value: 'square_feet' },
            { label: 'Bedrooms', value: 'bedrooms' },
            { label: 'Bathrooms', value: 'bathrooms' },
            { label: 'Account Number', value: 'account_number' },
            { label: 'Account Number (Alt)', value: 'Account #' },
            { label: 'Homeowner ID', value: 'homeowner_id' },
            { label: 'Homeowner ID (Alt)', value: 'Homeowner ID' },
            
            // Primary owner fields
            { label: 'First Name', value: 'first_name' },
            { label: 'First Name (Alt)', value: 'First Name' },
            { label: 'Last Name', value: 'last_name' },
            { label: 'Last Name (Alt)', value: 'Last Name' },
            { label: 'Email', value: 'email' },
            { label: 'Email (Alt)', value: 'Email' },
            { label: 'Phone', value: 'phone' },
            { label: 'Phone (Alt)', value: 'Phone' },
            { label: 'Move In Date', value: 'move_in_date' },
            { label: 'Settled Date', value: 'Settled Date' },
            { label: 'Emergency Contact', value: 'emergency_contact' },
            
            // Second owner fields
            { label: 'Second Owner First Name', value: 'second_owner_first_name' },
            { label: 'Second Owner First Name (Alt)', value: 'Second Owner First Name' },
            { label: 'Second Owner Last Name', value: 'second_owner_last_name' },
            { label: 'Second Owner Last Name (Alt)', value: 'Second Owner Last Name' },
            
            // Additional fields from CSV
            { label: 'Business Name', value: 'Business Name' },
            { label: 'Deed Name', value: 'Deed Name' },
            { label: 'Mailing Address', value: 'Mailing Address' },
            { label: 'Lot Number', value: 'Lot No' },
            { label: 'Block Number', value: 'Block No' },
            { label: 'Phase', value: 'Phase' },
            { label: 'Village', value: 'Village' },
            { label: 'Legal Description', value: 'Legal Description' },
            { label: 'Parcel ID', value: 'Parcel ID' },
            { label: 'Balance', value: 'Balance' },
            { label: 'Collection Status', value: 'Collection Status' }
          ];
        
        case 'financial':
          return [
            { label: 'Property ID', value: 'property_id' },
            { label: 'Amount', value: 'amount' },
            { label: 'Due Date', value: 'due_date' },
            { label: 'Description', value: 'description' },
            { label: 'Account Number', value: 'account_number' }
          ];
        
        case 'compliance':
          return [
            { label: 'Property ID', value: 'property_id' },
            { label: 'Violation Type', value: 'violation_type' },
            { label: 'Description', value: 'description' },
            { label: 'Fine Amount', value: 'fine_amount' },
            { label: 'Due Date', value: 'due_date' },
            { label: 'Account Number', value: 'account_number' }
          ];
        
        case 'maintenance':
          return [
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
        
        default:
          return [];
      }
    };

    setSystemFields(getSystemFields(importType));
  }, [importType]);

  return {
    fileColumns,
    systemFields,
    mappings,
    setMappings,
    previewData
  };
}
