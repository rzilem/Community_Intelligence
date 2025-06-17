
import { useState, useEffect } from 'react';
import { MappingOption } from './types/mapping-types';
import { useAssociationPropertyType } from '@/hooks/import-export/useAssociationPropertyType';

export function useMappingFields(
  importType: string, 
  fileData: any[], 
  associationId: string
) {
  const [fileColumns, setFileColumns] = useState<string[]>([]);
  const [systemFields, setSystemFields] = useState<MappingOption[]>([]);
  const [previewData, setPreviewData] = useState<any[]>([]);
  
  const { associationPropertyType, hasPropertyType } = useAssociationPropertyType(associationId);

  useEffect(() => {
    if (fileData && fileData.length > 0) {
      // Extract columns from the first row of data
      const columns = Object.keys(fileData[0] || {});
      setFileColumns(columns);
      
      // Set preview data (first 3 rows for mapping preview)
      setPreviewData(fileData.slice(0, 3));
    }
  }, [fileData]);

  useEffect(() => {
    // Generate system fields based on import type
    const fields = generateSystemFields(importType, associationId, hasPropertyType);
    setSystemFields(fields);
  }, [importType, associationId, hasPropertyType]);

  return {
    fileColumns,
    systemFields,
    previewData,
    associationPropertyType,
    hasPropertyType
  };
}

function generateSystemFields(importType: string, associationId: string, hasPropertyType: boolean): MappingOption[] {
  const commonFields: MappingOption[] = [
    { label: 'Association Identifier', value: 'association_identifier', required: associationId === 'all' },
    { label: 'Association Name', value: 'association_identifier', required: associationId === 'all' },
    { label: 'Association Code', value: 'association_identifier', required: associationId === 'all' },
    { label: 'HOA ID', value: 'association_identifier', required: associationId === 'all' },
    { label: 'HOA Name', value: 'association_identifier', required: associationId === 'all' }
  ];

  const baseFields: Record<string, MappingOption[]> = {
    properties: [
      { label: 'Address', value: 'address', required: true },
      { label: 'Property Address', value: 'address', required: true },
      { label: 'Unit Number', value: 'unit_number', required: false },
      { label: 'Unit No', value: 'unit_number', required: false },
      { label: 'Account Number', value: 'account_number', required: false },
      { label: 'Account #', value: 'account_number', required: false },
      { label: 'Homeowner ID', value: 'homeowner_id', required: false },
      { label: 'City', value: 'city', required: false },
      { label: 'State', value: 'state', required: false },
      { label: 'ZIP Code', value: 'zip', required: false },
      { label: 'Zip', value: 'zip', required: false },
      { label: 'Square Feet', value: 'square_feet', required: false },
      { label: 'Bedrooms', value: 'bedrooms', required: false },
      { label: 'Bathrooms', value: 'bathrooms', required: false },
      { label: 'Lot Number', value: 'lot_number', required: false },
      { label: 'Lot No', value: 'lot_number', required: false },
      { label: 'Block Number', value: 'block_number', required: false },
      { label: 'Block No', value: 'block_number', required: false },
      { label: 'Phase', value: 'phase', required: false },
      { label: 'Village', value: 'village', required: false },
      { label: 'Legal Description', value: 'legal_description', required: false },
      { label: 'Parcel ID', value: 'parcel_id', required: false }
    ],
    
    owners: [
      { label: 'First Name', value: 'first_name', required: true },
      { label: 'Last Name', value: 'last_name', required: true },
      { label: 'Property ID', value: 'property_id', required: true },
      { label: 'Property Address', value: 'property_address', required: false },
      { label: 'Account Number', value: 'account_number', required: false },
      { label: 'Account #', value: 'account_number', required: false },
      { label: 'Homeowner ID', value: 'homeowner_id', required: false },
      { label: 'Email', value: 'email', required: false },
      { label: 'Phone', value: 'phone', required: false },
      { label: 'Second Owner First Name', value: 'second_owner_first_name', required: false },
      { label: 'Second Owner Last Name', value: 'second_owner_last_name', required: false },
      { label: 'Business Name', value: 'business_name', required: false },
      { label: 'Deed Name', value: 'deed_name', required: false },
      { label: 'Mailing Address', value: 'mailing_address', required: false },
      { label: 'Move In Date', value: 'move_in_date', required: false },
      { label: 'Settled Date', value: 'move_in_date', required: false }
    ],

    properties_owners: [
      { label: 'Address', value: 'address', required: true },
      { label: 'Property Address', value: 'address', required: true },
      { label: 'First Name', value: 'first_name', required: false },
      { label: 'Last Name', value: 'last_name', required: false },
      { label: 'Unit Number', value: 'unit_number', required: false },
      { label: 'Unit No', value: 'unit_number', required: false },
      { label: 'Account Number', value: 'account_number', required: false },
      { label: 'Account #', value: 'account_number', required: false },
      { label: 'Homeowner ID', value: 'homeowner_id', required: false },
      { label: 'Email', value: 'email', required: false },
      { label: 'Phone', value: 'phone', required: false },
      { label: 'Second Owner First Name', value: 'second_owner_first_name', required: false },
      { label: 'Second Owner Last Name', value: 'second_owner_last_name', required: false },
      { label: 'Business Name', value: 'business_name', required: false },
      { label: 'Deed Name', value: 'deed_name', required: false },
      { label: 'Mailing Address', value: 'mailing_address', required: false },
      { label: 'Move In Date', value: 'move_in_date', required: false },
      { label: 'Settled Date', value: 'move_in_date', required: false },
      { label: 'City', value: 'city', required: false },
      { label: 'State', value: 'state', required: false },
      { label: 'ZIP Code', value: 'zip', required: false },
      { label: 'Zip', value: 'zip', required: false },
      { label: 'Square Feet', value: 'square_feet', required: false },
      { label: 'Bedrooms', value: 'bedrooms', required: false },
      { label: 'Bathrooms', value: 'bathrooms', required: false },
      { label: 'Balance', value: 'balance', required: false },
      { label: 'Collection Status', value: 'collection_status', required: false }
    ],

    financial: [
      { label: 'Property ID', value: 'property_id', required: true },
      { label: 'Property Address', value: 'property_address', required: false },
      { label: 'Account Number', value: 'account_number', required: false },
      { label: 'Account #', value: 'account_number', required: false },
      { label: 'Amount', value: 'amount', required: true },
      { label: 'Due Date', value: 'due_date', required: true },
      { label: 'Assessment Type', value: 'assessment_type', required: false },
      { label: 'Description', value: 'description', required: false },
      { label: 'Late Fee', value: 'late_fee', required: false },
      { label: 'Payment Status', value: 'payment_status', required: false },
      { label: 'Balance', value: 'balance', required: false }
    ],

    compliance: [
      { label: 'Property ID', value: 'property_id', required: true },
      { label: 'Property Address', value: 'property_address', required: false },
      { label: 'Account Number', value: 'account_number', required: false },
      { label: 'Account #', value: 'account_number', required: false },
      { label: 'Violation Type', value: 'violation_type', required: true },
      { label: 'Description', value: 'description', required: false },
      { label: 'Due Date', value: 'due_date', required: false },
      { label: 'Fine Amount', value: 'fine_amount', required: false },
      { label: 'Status', value: 'status', required: false }
    ],

    maintenance: [
      { label: 'Property ID', value: 'property_id', required: true },
      { label: 'Property Address', value: 'property_address', required: false },
      { label: 'Account Number', value: 'account_number', required: false },
      { label: 'Account #', value: 'account_number', required: false },
      { label: 'Title', value: 'title', required: true },
      { label: 'Description', value: 'description', required: true },
      { label: 'Priority', value: 'priority', required: false },
      { label: 'Status', value: 'status', required: false },
      { label: 'Category', value: 'category', required: false },
      { label: 'Assigned To', value: 'assigned_to', required: false }
    ],

    associations: [
      { label: 'Name', value: 'name', required: true },
      { label: 'Association Name', value: 'name', required: true },
      { label: 'Code', value: 'code', required: false },
      { label: 'Association Code', value: 'code', required: false },
      { label: 'Address', value: 'address', required: false },
      { label: 'City', value: 'city', required: false },
      { label: 'State', value: 'state', required: false },
      { label: 'ZIP Code', value: 'zip', required: false },
      { label: 'Zip', value: 'zip', required: false },
      { label: 'Phone', value: 'phone', required: false },
      { label: 'Contact Email', value: 'contact_email', required: false },
      { label: 'Property Type', value: 'property_type', required: false },
      { label: 'Total Units', value: 'total_units', required: false }
    ]
  };

  // Get base fields for the import type
  let fields = baseFields[importType] || [];

  // Add property type field only when actually needed
  const needsPropertyType = shouldIncludePropertyType(importType, associationId, hasPropertyType);
  if (needsPropertyType) {
    const propertyTypeField: MappingOption = {
      label: 'Property Type',
      value: 'property_type',
      required: true
    };
    // Add property type field after address fields but before optional fields
    const insertIndex = fields.findIndex(f => ['unit_number', 'account_number', 'city'].includes(f.value));
    if (insertIndex > 0) {
      fields.splice(insertIndex, 0, propertyTypeField);
    } else {
      fields.push(propertyTypeField);
    }
  }

  // Add common association fields for "All Associations" imports
  if (associationId === 'all' && importType !== 'associations') {
    fields = [...commonFields, ...fields];
  }

  return fields;
}

function shouldIncludePropertyType(importType: string, associationId: string, hasPropertyType: boolean): boolean {
  // Don't require property type for non-property related imports
  if (!['properties', 'properties_owners'].includes(importType)) {
    return false;
  }

  // Always require for "All Associations" imports
  if (associationId === 'all') {
    return true;
  }

  // For specific associations, only require if they don't have a default property type
  return !hasPropertyType;
}
