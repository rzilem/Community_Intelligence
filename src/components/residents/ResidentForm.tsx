
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ResidentWithProfile, Property } from '@/types/app-types';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { ResidentInputField } from './form/ResidentInputField';
import { ResidentTypeSelect } from './form/ResidentTypeSelect';
import { PropertySelect } from './form/PropertySelect';
import { ResidentCheckboxField } from './form/ResidentCheckboxField';

interface ResidentFormProps {
  defaultValues: Partial<ResidentWithProfile>;
  onSubmit: (data: Partial<ResidentWithProfile>) => void;
  isSubmitting: boolean;
  onCancel: () => void;
}

export const ResidentForm: React.FC<ResidentFormProps> = ({ 
  defaultValues, 
  onSubmit,
  isSubmitting,
  onCancel
}) => {
  const { currentAssociation } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(false);
  
  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<Partial<ResidentWithProfile>>({
    defaultValues
  });
  
  const residentType = watch('resident_type');
  const isPrimary = watch('is_primary');

  useEffect(() => {
    const fetchProperties = async () => {
      if (!currentAssociation) return;
      
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('properties')
          .select('*')
          .eq('association_id', currentAssociation.id);
          
        if (error) throw error;
        setProperties(data as Property[]);
      } catch (error) {
        console.error('Error fetching properties:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProperties();
  }, [currentAssociation]);
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="grid gap-4 py-4">
        <ResidentInputField
          id="name"
          label="Name"
          placeholder="John Doe"
          register={register}
          name="name"
          rules={{ required: 'Name is required' }}
          error={errors.name}
        />
        
        <ResidentInputField
          id="email"
          label="Email"
          type="email"
          placeholder="john@example.com"
          register={register}
          name="email"
          rules={{ 
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: "Invalid email address"
            }
          }}
          error={errors.email}
        />
        
        <ResidentInputField
          id="phone"
          label="Phone"
          placeholder="(123) 456-7890"
          register={register}
          name="phone"
        />
        
        <ResidentTypeSelect
          residentType={residentType || 'owner'}
          onChange={(value) => setValue('resident_type', value)}
        />
        
        <PropertySelect
          properties={properties}
          selectedPropertyId={defaultValues.property_id}
          onChange={(value) => setValue('property_id', value)}
          loading={loading}
        />
        
        <ResidentCheckboxField
          id="is_primary"
          label="Primary resident for this property"
          checked={!!isPrimary}
          onCheckedChange={(checked) => setValue('is_primary', checked)}
        />
        
        <ResidentInputField
          id="move_in_date"
          label="Move-in Date"
          type="date"
          register={register}
          name="move_in_date"
        />
        
        <ResidentInputField
          id="move_out_date"
          label="Move-out Date"
          type="date"
          register={register}
          name="move_out_date"
        />
        
        <ResidentInputField
          id="emergency_contact"
          label="Emergency Contact"
          placeholder="Name: (123) 456-7890"
          register={register}
          name="emergency_contact"
        />
      </div>
      
      <DialogFooter>
        <Button variant="outline" type="button" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : defaultValues.id ? 'Update' : 'Add'} Resident
        </Button>
      </DialogFooter>
    </form>
  );
};
