
import React, { useEffect } from 'react';
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
  const { data: associations = [], isLoading: isLoadingAssociations } = useSupabaseQuery<any[]>(
    'associations',
    {
      select: 'id, name',
      order: { column: 'name', ascending: true },
    }
  );

  // Fetch properties for the select dropdown
  const { data: properties = [], isLoading: isLoadingProperties } = useSupabaseQuery<any[]>(
    'properties',
    {
      select: 'id, address, unit_number, association_id',
      filter: selectedAssociationId && selectedAssociationId !== 'unassigned' 
        ? [{ column: 'association_id', value: selectedAssociationId }] 
        : undefined,
      order: { column: 'address', ascending: true },
    },
    // Only execute query if we have a valid association ID (not 'unassigned')
    !!(selectedAssociationId && selectedAssociationId !== 'unassigned')
  );

  // Fetch residents for the select dropdown - only if property ID is valid
  const { data: residents = [], isLoading: isLoadingResidents } = useSupabaseQuery<any[]>(
    'residents',
    {
      select: 'id, name, email, property_id',
      filter: selectedPropertyId && selectedPropertyId !== 'unassigned'
        ? [{ column: 'property_id', value: selectedPropertyId }]
        : undefined,
      order: { column: 'name', ascending: true },
    },
    // Only execute query if we have a valid property ID (not 'unassigned')
    !!(selectedPropertyId && selectedPropertyId !== 'unassigned')
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
    if (selectedAssociationId === 'unassigned' || selectedAssociationId === undefined) {
      setTimeout(() => {
        form.setValue('property_id', 'unassigned', { shouldValidate: true });
        form.setValue('resident_id', 'unassigned', { shouldValidate: true });
      }, 0);
    }
  }, [selectedAssociationId, form]);

  // Reset residentId when property changes
  useEffect(() => {
    if (selectedPropertyId === 'unassigned' || selectedPropertyId === undefined) {
      setTimeout(() => {
        form.setValue('resident_id', 'unassigned', { shouldValidate: true });
      }, 0);
    }
  }, [selectedPropertyId, form]);

  return (
    <div className={inline ? "space-y-2" : "space-y-4"}>
      {!inline && (
        <h3 className="text-base font-medium">
          Assignment Information
          {optional && <span className="ml-2 text-sm font-normal text-muted-foreground">(Optional)</span>}
        </h3>
      )}
      
      <FormFieldSelect
        form={form}
        name="association_id"
        label="Association"
        placeholder={isLoadingAssociations ? "Loading..." : "Select an association"}
        options={associationOptions}
        required={!optional}
        disabled={isLoadingAssociations}
      />
      
      <FormFieldSelect
        form={form}
        name="property_id"
        label="Property"
        placeholder={
          isLoadingProperties 
            ? "Loading..." 
            : (selectedAssociationId && selectedAssociationId !== 'unassigned' 
                ? "Select a property" 
                : "Select an association first")
        }
        options={propertyOptions}
        disabled={!selectedAssociationId || selectedAssociationId === 'unassigned' || isLoadingProperties}
        required={!optional}
      />
      
      <FormFieldSelect
        form={form}
        name="resident_id"
        label="Resident"
        placeholder={
          isLoadingResidents
            ? "Loading..."
            : (selectedPropertyId && selectedPropertyId !== 'unassigned' 
                ? "Select a resident" 
                : "Select a property first")
        }
        options={residentOptions}
        disabled={
          (!selectedPropertyId || selectedPropertyId === 'unassigned' || isLoadingResidents)
        }
        required={!optional}
      />
    </div>
  );
};

export default RequestAssignmentFields;
