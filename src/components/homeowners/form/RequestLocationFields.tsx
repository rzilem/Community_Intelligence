
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import FormFieldSelect from './FormFieldSelect';

interface RequestLocationFieldsProps {
  form: UseFormReturn<any>;
  associations: any[];
  properties: any[];
  selectedAssociationId: string;
}

const RequestLocationFields = ({ 
  form, 
  associations,
  properties,
  selectedAssociationId
}: RequestLocationFieldsProps) => {
  // Filter properties based on selected association
  const filteredProperties = selectedAssociationId 
    ? properties.filter(property => property.association_id === selectedAssociationId)
    : properties;

  const associationOptions = associations.map(association => ({
    value: association.id,
    label: association.name
  }));

  const propertyOptions = filteredProperties.map(property => ({
    value: property.id,
    label: `${property.address} ${property.unit_number ? `Unit ${property.unit_number}` : ''}`
  }));

  return (
    <div className="space-y-4">
      <FormFieldSelect
        form={form}
        name="associationId"
        label="Association"
        placeholder="Select association"
        options={associationOptions}
      />
      
      <FormFieldSelect
        form={form}
        name="propertyId"
        label="Property"
        placeholder={selectedAssociationId ? "Select property" : "Select an association first"}
        options={propertyOptions}
        disabled={!selectedAssociationId}
      />
    </div>
  );
};

export default RequestLocationFields;
