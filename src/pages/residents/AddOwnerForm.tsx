
import React, { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { toast } from 'sonner';
import { createResident } from '@/services/hoa/resident-service';
import FormFieldInput from './components/form/FormFieldInput';
import FormFieldSelect from './components/form/FormFieldSelect';
import FormFieldCheckbox from './components/form/FormFieldCheckbox';
import { ownerFormSchema, OwnerFormValues, defaultOwnerFormValues } from './schemas/ownerFormSchema';
import { usePropertyAssociations } from './hooks/usePropertyAssociations';

interface AddOwnerFormProps {
  onSuccess: (newOwner: any) => void;
  onCancel: () => void;
}

const AddOwnerForm: React.FC<AddOwnerFormProps> = ({ onSuccess, onCancel }) => {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<OwnerFormValues>({
    resolver: zodResolver(ownerFormSchema),
    defaultValues: defaultOwnerFormValues
  });

  const { associations, filteredProperties, loading } = usePropertyAssociations(form);

  // Resident type options
  const residentTypeOptions = [
    { value: 'owner', label: 'Owner' },
    { value: 'tenant', label: 'Tenant' },
    { value: 'family', label: 'Family Member' },
    { value: 'other', label: 'Other' }
  ];

  const associationOptions = associations.map(association => ({
    value: association.id,
    label: association.name
  }));

  const propertyOptions = filteredProperties.map(property => ({
    value: property.id,
    label: `${property.address}${property.unit_number ? ` Unit ${property.unit_number}` : ''}`
  }));

  const onSubmit = async (data: OwnerFormValues) => {
    setIsLoading(true);
    try {
      console.log("Submitting form with data:", data);
      
      // Create the resident directly using the resident service
      const newResident = await createResident({
        name: data.name,
        email: data.email,
        phone: data.phone || null,
        property_id: data.property_id,
        resident_type: data.resident_type,
        is_primary: data.is_primary,
        move_in_date: data.move_in_date || null,
        emergency_contact: data.emergency_contact || null
      });

      if (newResident) {
        console.log("New resident created:", newResident);
        
        // Get property details
        const selectedProperty = filteredProperties.find(p => p.id === data.property_id);
        const selectedAssociation = associations.find(a => a.id === data.association_id);

        // Create a mock object for UI integration
        const newOwnerForUI = {
          id: newResident.id,
          name: data.name,
          email: data.email,
          phone: data.phone || '',
          type: data.resident_type,
          propertyAddress: selectedProperty?.address || 'Unknown',
          association: selectedAssociation?.name || 'Unknown',
          status: 'active',
          moveInDate: data.move_in_date || new Date().toISOString().split('T')[0],
          propertyId: data.property_id
        };

        onSuccess(newOwnerForUI);
      }
    } catch (error: any) {
      console.error('Error adding owner:', error);
      toast.error(error.message || 'Failed to add owner');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormFieldInput
          form={form}
          name="name"
          label="Full Name"
          placeholder="John Doe"
          required
        />

        <FormFieldInput
          form={form}
          name="email"
          label="Email"
          placeholder="john@example.com"
          type="email"
          required
        />

        <FormFieldInput
          form={form}
          name="phone"
          label="Phone Number"
          placeholder="(123) 456-7890"
        />

        <FormFieldSelect
          form={form}
          name="association_id"
          label="Association"
          placeholder="Select an association"
          options={associationOptions}
          required
        />

        <FormFieldSelect
          form={form}
          name="property_id"
          label="Property"
          placeholder={form.watch('association_id') ? "Select a property" : "Select an association first"}
          options={propertyOptions}
          disabled={!form.watch('association_id') || loading}
          required
        />

        <FormFieldSelect
          form={form}
          name="resident_type"
          label="Resident Type"
          placeholder="Select a type"
          options={residentTypeOptions}
          required
        />

        <FormFieldCheckbox
          form={form}
          name="is_primary"
          label="Primary Resident"
          description="This is the primary owner/resident for the property"
        />

        <FormFieldInput
          form={form}
          name="move_in_date"
          label="Move-In Date"
          type="date"
        />

        <FormFieldInput
          form={form}
          name="emergency_contact"
          label="Emergency Contact"
          placeholder="Name: (123) 456-7890"
        />

        <div className="flex justify-end space-x-2 pt-4">
          <Button variant="outline" type="button" onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Adding...' : 'Add Owner'}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default AddOwnerForm;
