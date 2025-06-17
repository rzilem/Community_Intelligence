
import { useMemo } from 'react';
import { MappingOption } from './types/mapping-types';
import { useAssociationPropertyType } from '@/hooks/import-export/useAssociationPropertyType';

export function useMappingFields(importType: string, fileData: any[], associationId: string) {
  const { associationPropertyType, hasPropertyType } = useAssociationPropertyType(associationId);
  
  const fileColumns = useMemo(() => {
    if (!fileData || !Array.isArray(fileData) || fileData.length === 0) {
      return [];
    }
    
    const firstRow = fileData[0];
    if (!firstRow || typeof firstRow !== 'object') {
      return [];
    }
    
    return Object.keys(firstRow).filter(key => key && key.trim() !== '');
  }, [fileData]);

  const previewData = useMemo(() => {
    return fileData?.slice(0, 3) || [];
  }, [fileData]);

  const systemFields = useMemo((): MappingOption[] => {
    const baseFields: MappingOption[] = [];
    
    if (importType === 'properties') {
      baseFields.push(
        { label: 'Address', value: 'address', required: true },
        { label: 'Unit Number', value: 'unit_number' },
        { label: 'Square Footage', value: 'square_footage' },
        { label: 'Bedrooms', value: 'bedrooms' },
        { label: 'Bathrooms', value: 'bathrooms' }
      );
      
      // Only add property_type as required if association doesn't have default property type
      if (!hasPropertyType || associationId === 'all') {
        baseFields.push({ label: 'Property Type', value: 'property_type', required: true });
      }
      
      baseFields.push(
        { label: 'Property Status', value: 'status' },
        { label: 'Property ID', value: 'property_id' },
        { label: 'Account Number', value: 'account_number' },
        { label: 'Lot Number', value: 'lot_number' },
        { label: 'Block Number', value: 'block_number' },
        { label: 'Section', value: 'section' },
        { label: 'Phase', value: 'phase' },
        { label: 'Building', value: 'building' },
        { label: 'Floor', value: 'floor' },
        { label: 'Year Built', value: 'year_built' },
        { label: 'Parking Spaces', value: 'parking_spaces' },
        { label: 'Special Assessments', value: 'special_assessments' },
        { label: 'Notes', value: 'notes' }
      );
    } else if (importType === 'owners' || importType === 'residents') {
      baseFields.push(
        { label: 'First Name', value: 'first_name', required: true },
        { label: 'Last Name', value: 'last_name', required: true },
        { label: 'Email', value: 'email' },
        { label: 'Phone', value: 'phone' },
        { label: 'Address', value: 'address' },
        { label: 'Property ID', value: 'property_id', required: true },
        { label: 'Account Number', value: 'account_number' },
        { label: 'Owner Type', value: 'owner_type' },
        { label: 'Mailing Address', value: 'mailing_address' },
        { label: 'Emergency Contact', value: 'emergency_contact' },
        { label: 'Emergency Phone', value: 'emergency_phone' },
        { label: 'Move In Date', value: 'move_in_date' },
        { label: 'Move Out Date', value: 'move_out_date' },
        { label: 'Notes', value: 'notes' }
      );
    } else if (importType === 'properties_owners') {
      baseFields.push(
        { label: 'Address', value: 'address', required: true },
        { label: 'First Name', value: 'first_name' },
        { label: 'Last Name', value: 'last_name' },
        { label: 'Email', value: 'email' },
        { label: 'Phone', value: 'phone' },
        { label: 'Account Number', value: 'account_number' },
        { label: 'Unit Number', value: 'unit_number' },
        { label: 'Property ID', value: 'property_id' },
        { label: 'Owner Type', value: 'owner_type' },
        { label: 'Mailing Address', value: 'mailing_address' },
        { label: 'Emergency Contact', value: 'emergency_contact' },
        { label: 'Emergency Phone', value: 'emergency_phone' }
      );
      
      // Only add property_type as required if association doesn't have default property type
      if (!hasPropertyType || associationId === 'all') {
        baseFields.push({ label: 'Property Type', value: 'property_type', required: true });
      }
    } else if (importType === 'financial') {
      baseFields.push(
        { label: 'Property ID', value: 'property_id', required: true },
        { label: 'Account Number', value: 'account_number' },
        { label: 'Amount', value: 'amount', required: true },
        { label: 'Due Date', value: 'due_date', required: true },
        { label: 'Assessment Type', value: 'assessment_type' },
        { label: 'Description', value: 'description' },
        { label: 'Late Fee', value: 'late_fee' },
        { label: 'Payment Status', value: 'payment_status' },
        { label: 'Payment Date', value: 'payment_date' },
        { label: 'Payment Method', value: 'payment_method' },
        { label: 'Reference Number', value: 'reference_number' }
      );
    } else if (importType === 'compliance') {
      baseFields.push(
        { label: 'Property ID', value: 'property_id', required: true },
        { label: 'Account Number', value: 'account_number' },
        { label: 'Violation Type', value: 'violation_type', required: true },
        { label: 'Description', value: 'description' },
        { label: 'Due Date', value: 'due_date' },
        { label: 'Fine Amount', value: 'fine_amount' },
        { label: 'Status', value: 'status' },
        { label: 'Resolved Date', value: 'resolved_date' },
        { label: 'Notes', value: 'notes' }
      );
    } else if (importType === 'maintenance') {
      baseFields.push(
        { label: 'Property ID', value: 'property_id', required: true },
        { label: 'Account Number', value: 'account_number' },
        { label: 'Title', value: 'title', required: true },
        { label: 'Description', value: 'description', required: true },
        { label: 'Priority', value: 'priority' },
        { label: 'Status', value: 'status' },
        { label: 'Category', value: 'category' },
        { label: 'Assigned To', value: 'assigned_to' },
        { label: 'Due Date', value: 'due_date' },
        { label: 'Completed Date', value: 'completed_date' }
      );
    } else if (importType === 'associations') {
      baseFields.push(
        { label: 'Association Name', value: 'name', required: true },
        { label: 'Association Code', value: 'code' },
        { label: 'Address', value: 'address' },
        { label: 'City', value: 'city' },
        { label: 'State', value: 'state' },
        { label: 'ZIP Code', value: 'zip' },
        { label: 'Phone', value: 'phone' },
        { label: 'Email', value: 'contact_email' },
        { label: 'Property Type', value: 'property_type' },
        { label: 'Total Units', value: 'total_units' },
        { label: 'Description', value: 'description' }
      );
    }

    // Add association identifier for "all associations" imports
    if (associationId === 'all' && importType !== 'associations') {
      baseFields.unshift(
        { label: 'Association ID', value: 'association_id' },
        { label: 'Association Code', value: 'association_code' },
        { label: 'Association Name', value: 'association_name' }
      );
    }

    return baseFields;
  }, [importType, associationId, hasPropertyType]);

  return {
    fileColumns,
    systemFields,
    previewData,
    associationPropertyType,
    hasPropertyType
  };
}
