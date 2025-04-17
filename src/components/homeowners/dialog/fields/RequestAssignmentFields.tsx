
import React, { useEffect, useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { useSupabaseQuery } from '@/hooks/supabase';
import FormFieldSelect from '@/components/homeowners/form/FormFieldSelect';

interface RequestAssignmentFieldsProps {
  form: UseFormReturn<any>;
  optional?: boolean;
  inline?: boolean;
}

const RequestAssignmentFields: React.FC<RequestAssignmentFieldsProps> = ({ 
  form,
  optional = false,
  inline = false
}) => {
  // Get selected association ID for filtering properties and residents
  const selectedAssociationId = form.watch('association_id');
  const selectedPropertyId = form.watch('property_id');
  
  // Fetch associations for the select dropdown
  const { data: associations = [] } = useSupabaseQuery<any[]>(
    'associations',
    {
      select: 'id, name',
      order: { column: 'name', ascending: true },
    }
  );

  // Fetch properties for the select dropdown
  const { data: properties = [] } = useSupabaseQuery<any[]>(
    'properties',
    {
      select: 'id, address, unit_number, association_id',
      filter: selectedAssociationId ? [{ column: 'association_id', value: selectedAssociationId }] : [],
      order: { column: 'address', ascending: true },
    },
    !!selectedAssociationId
  );

  // Fetch residents for the select dropdown
  const { data: residents = [] } = useSupabaseQuery<any[]>(
    'residents',
    {
      select: 'id, name, email, property_id',
      filter: selectedPropertyId 
        ? [{ column: 'property_id', value: selectedPropertyId }]
        : (selectedAssociationId ? [] : []),
      order: { column: 'name', ascending: true },
    },
    !!selectedPropertyId || !!selectedAssociationId
  );

  const associationOptions = associations.map(association => ({
    value: association.id,
    label: association.name,
  }));

  const propertyOptions = properties.map(property => ({
    value: property.id,
    label: `${property.address} ${property.unit_number ? `Unit ${property.unit_number}` : ''}`,
  }));

  const residentOptions = residents.map(resident => ({
    value: resident.id,
    label: resident.name || resident.email || `Resident ${resident.id.substring(0, 8)}`,
  }));

  // Reset propertyId when association changes
  useEffect(() => {
    if (selectedAssociationId) {
      form.setValue('property_id', '');
    }
  }, [selectedAssociationId, form]);

  // Reset residentId when property changes
  useEffect(() => {
    if (selectedPropertyId) {
      form.setValue('resident_id', '');
    }
  }, [selectedPropertyId, form]);

  return (
    <div className={inline ? "space-y-2" : "space-y-4"}>
      {!inline && (
        <h3 className="text-base font-medium">
          {optional && <span className="text-sm font-normal text-muted-foreground">(Optional)</span>}
        </h3>
      )}
      
      <FormFieldSelect
        form={form}
        name="association_id"
        label="Association"
        placeholder="Select an association"
        options={associationOptions}
        required={!optional}
      />
      
      <FormFieldSelect
        form={form}
        name="property_id"
        label="Property"
        placeholder={selectedAssociationId ? "Select a property" : "Select an association first"}
        options={propertyOptions}
        disabled={!selectedAssociationId}
        required={!optional}
      />
      
      <FormFieldSelect
        form={form}
        name="resident_id"
        label="Resident"
        placeholder={selectedPropertyId ? "Select a resident" : "Select a property first"}
        options={residentOptions}
        disabled={!selectedPropertyId && !selectedAssociationId}
        required={!optional}
      />
    </div>
  );
};

export default RequestAssignmentFields;
