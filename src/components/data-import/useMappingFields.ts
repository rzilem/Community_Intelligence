
import { useState, useEffect } from 'react';
import { MappingOption } from './types/mapping-types';

export const useMappingFields = (
  importType: string,
  fileData: any[],
  associationId: string,
  savedMappings?: Record<string, string>
) => {
  const [fileColumns, setFileColumns] = useState<string[]>([]);
  const [systemFields, setSystemFields] = useState<MappingOption[]>([]);
  const [mappings, setMappings] = useState<Record<string, string>>(savedMappings || {});
  const [previewData, setPreviewData] = useState<any[]>([]);
  
  // Extract columns from the file data
  useEffect(() => {
    if (fileData.length > 0) {
      const columns = Object.keys(fileData[0]);
      setFileColumns(columns);
      
      // Set preview data (first 3 rows)
      setPreviewData(fileData.slice(0, 3));
      
      if (!savedMappings) {
        autoMapColumns(columns);
      }
    }
  }, [fileData, savedMappings]);
  
  // Load appropriate system fields based on importType
  useEffect(() => {
    switch (importType) {
      case 'associations':
        setSystemFields([
          { value: 'name', label: 'Association Name' },
          { value: 'address', label: 'Street Address' },
          { value: 'contact_email', label: 'Contact Email' }
        ]);
        break;
      case 'properties_owners':
        setSystemFields([
          // Property fields
          { value: 'property.address', label: 'Property: Street Address' },
          { value: 'property.unit_number', label: 'Property: Unit Number' },
          { value: 'property.city', label: 'Property: City' },
          { value: 'property.state', label: 'Property: State' },
          { value: 'property.zip', label: 'Property: Zip Code' },
          { value: 'property.square_feet', label: 'Property: Square Footage' },
          { value: 'property.bedrooms', label: 'Property: Bedrooms' },
          { value: 'property.bathrooms', label: 'Property: Bathrooms' },
          { value: 'property.property_type', label: 'Property: Type' },
          // Owner fields
          { value: 'owner.first_name', label: 'Owner: First Name' },
          { value: 'owner.last_name', label: 'Owner: Last Name' },
          { value: 'owner.email', label: 'Owner: Email Address' },
          { value: 'owner.phone', label: 'Owner: Phone Number' },
          { value: 'owner.move_in_date', label: 'Owner: Move-in Date' },
          { value: 'owner.is_primary', label: 'Owner: Is Primary Owner' },
          { value: 'owner.emergency_contact', label: 'Owner: Emergency Contact' }
        ]);
        break;
      case 'owners':
        setSystemFields([
          { value: 'first_name', label: 'First Name' },
          { value: 'last_name', label: 'Last Name' },
          { value: 'email', label: 'Email Address' },
          { value: 'phone', label: 'Phone Number' },
          { value: 'property_id', label: 'Property ID' },
          { value: 'move_in_date', label: 'Move-in Date' },
          { value: 'is_primary', label: 'Is Primary Owner' },
          { value: 'emergency_contact', label: 'Emergency Contact' }
        ]);
        break;
      case 'properties':
        setSystemFields([
          { value: 'address', label: 'Street Address' },
          { value: 'unit_number', label: 'Unit Number' },
          { value: 'city', label: 'City' },
          { value: 'state', label: 'State' },
          { value: 'zip', label: 'Zip Code' },
          { value: 'square_feet', label: 'Square Footage' },
          { value: 'bedrooms', label: 'Bedrooms' },
          { value: 'bathrooms', label: 'Bathrooms' },
          { value: 'property_type', label: 'Property Type' }
        ]);
        break;
      case 'financial':
        setSystemFields([
          { value: 'property_id', label: 'Property ID' },
          { value: 'assessment_type_id', label: 'Assessment Type ID' },
          { value: 'amount', label: 'Amount' },
          { value: 'due_date', label: 'Due Date' },
          { value: 'paid', label: 'Paid Status' },
          { value: 'payment_date', label: 'Payment Date' },
          { value: 'late_fee', label: 'Late Fee Amount' }
        ]);
        break;
      case 'compliance':
        setSystemFields([
          { value: 'property_id', label: 'Property ID' },
          { value: 'resident_id', label: 'Resident ID' },
          { value: 'violation_type', label: 'Violation Type' },
          { value: 'description', label: 'Description' },
          { value: 'status', label: 'Status' },
          { value: 'due_date', label: 'Due Date' },
          { value: 'fine_amount', label: 'Fine Amount' },
          { value: 'resolved_date', label: 'Resolved Date' }
        ]);
        break;
      case 'maintenance':
        setSystemFields([
          { value: 'property_id', label: 'Property ID' },
          { value: 'title', label: 'Title' },
          { value: 'description', label: 'Description' },
          { value: 'priority', label: 'Priority' },
          { value: 'status', label: 'Status' },
          { value: 'assigned_to', label: 'Assigned To' },
          { value: 'resolved_date', label: 'Resolved Date' }
        ]);
        break;
      default:
        setSystemFields([]);
    }
  }, [importType]);
  
  // Auto-map columns that have similar names to system fields
  const autoMapColumns = (columns: string[]) => {
    const initialMappings: Record<string, string> = {};
    columns.forEach(column => {
      const lowerColumn = column.toLowerCase();
      
      // Try to find a match
      const match = systemFields.find(field => 
        lowerColumn.includes(field.value.split('.').pop() || '') || 
        field.label.toLowerCase().includes(lowerColumn) ||
        lowerColumn.replace(/[^a-z0-9]/gi, '') === field.value.replace(/[^a-z0-9]/gi, '') ||
        lowerColumn.replace(/[^a-z0-9]/gi, '') === field.label.toLowerCase().replace(/[^a-z0-9]/gi, '')
      );
      
      if (match) {
        initialMappings[column] = match.value;
      }
    });
    
    setMappings(initialMappings);
  };

  return {
    fileColumns,
    systemFields,
    mappings,
    setMappings,
    previewData
  };
};
