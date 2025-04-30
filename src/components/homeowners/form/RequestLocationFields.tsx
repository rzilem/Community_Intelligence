
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import FormFieldSelect from './FormFieldSelect';

interface RequestLocationFieldsProps {
  form: UseFormReturn<any>;
  associations: any[];
  properties: any[];
  selectedAssociationId: string;
  optional?: boolean;
}

const RequestLocationFields = ({ 
  form, 
  associations,
  properties,
  selectedAssociationId,
  optional = false
}: RequestLocationFieldsProps) => {
  // Filter properties based on selected association
  const filteredProperties = selectedAssociationId 
    ? properties.filter(property => property.association_id === selectedAssociationId)
    : [];

  const associationOptions = associations.map(association => ({
    value: association.id,
    label: association.name
  }));

  const propertyOptions = filteredProperties.map(property => ({
    value: property.id,
    label: `${property.address} ${property.unit_number ? `Unit ${property.unit_number}` : ''}`
  }));

  // Clear property selection when association changes
  React.useEffect(() => {
    form.setValue('propertyId', '');
  }, [selectedAssociationId, form]);

  return (
    <div className="space-y-4">
      <FormFieldSelect
        form={form}
        name="associationId"
        label={`Association${optional ? ' (Optional)' : ''}`}
        placeholder="Select association"
        options={associationOptions}
        required={!optional}
      />
      
      <FormFieldSelect
        form={form}
        name="propertyId"
        label={`Property${optional ? ' (Optional)' : ''}`}
        placeholder={selectedAssociationId ? "Select property" : "Select an association first"}
        options={propertyOptions}
        disabled={!selectedAssociationId}
        required={!optional}
      />
    </div>
  );
};

export default RequestLocationFields;
