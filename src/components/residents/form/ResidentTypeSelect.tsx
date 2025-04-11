
import React from 'react';
import { ResidentSelectField } from './ResidentSelectField';
import { ResidentType } from '@/types/resident-types';

interface ResidentTypeSelectProps {
  residentType: ResidentType;
  onChange: (value: ResidentType) => void;
}

export const ResidentTypeSelect: React.FC<ResidentTypeSelectProps> = ({
  residentType,
  onChange
}) => {
  // Helper function to safely cast string to ResidentType
  const toResidentType = (value: string): ResidentType => {
    const validTypes: ResidentType[] = ['owner', 'tenant', 'family', 'other'];
    return validTypes.includes(value as ResidentType) 
      ? (value as ResidentType) 
      : 'other';
  };

  const residentTypeOptions = [
    { value: 'owner', label: 'Owner' },
    { value: 'tenant', label: 'Tenant' },
    { value: 'family', label: 'Family Member' },
    { value: 'other', label: 'Other' }
  ];

  return (
    <ResidentSelectField
      id="resident_type"
      label="Resident Type"
      placeholder="Select resident type"
      options={residentTypeOptions}
      value={residentType || 'owner'}
      onChange={(value) => onChange(toResidentType(value))}
    />
  );
};
