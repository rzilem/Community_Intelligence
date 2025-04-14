
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
import { Alert, AlertDescription } from '@/components/ui/alert';
import { InfoIcon } from 'lucide-react';

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
  const [associations, setAssociations] = useState<any[]>([]);
  const [selectedAssociationId, setSelectedAssociationId] = useState<string>(currentAssociation?.id || '');
  
  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<Partial<ResidentWithProfile>>({
    defaultValues
  });
  
  const residentType = watch('resident_type');
  const isPrimary = watch('is_primary');
  const selectedPropertyId = watch('property_id');

  // Fetch associations the user has access to
  useEffect(() => {
    const fetchAssociations = async () => {
      try {
        const { data, error } = await supabase.rpc('get_user_associations');
        if (error) throw error;
        
        setAssociations(data || []);
        
        // If there's only one association, auto-select it
        if (data && data.length === 1 && !selectedAssociationId) {
          setSelectedAssociationId(data[0].id);
        }
      } catch (error) {
        console.error('Error fetching associations:', error);
      }
    };
    
    fetchAssociations();
  }, [selectedAssociationId]);

  // Fetch properties for the selected association
  useEffect(() => {
    const fetchProperties = async () => {
      if (!selectedAssociationId) return;
      
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('properties')
          .select('*')
          .eq('association_id', selectedAssociationId);
          
        if (error) throw error;
        setProperties(data as Property[]);
        
        // If the currently selected property doesn't belong to this association, clear it
        if (selectedPropertyId) {
          const propertyExists = data.some(p => p.id === selectedPropertyId);
          if (!propertyExists) {
            setValue('property_id', '');
          }
        }
      } catch (error) {
        console.error('Error fetching properties:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProperties();
  }, [selectedAssociationId, selectedPropertyId, setValue]);
  
  // Handle association change
  const handleAssociationChange = (associationId: string) => {
    setSelectedAssociationId(associationId);
    // Clear property selection when association changes
    setValue('property_id', '');
  };
  
  const filteredProperties = selectedAssociationId 
    ? properties.filter(p => p.association_id === selectedAssociationId)
    : [];
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="grid gap-4 py-4">
        {associations.length > 1 && (
          <div className="space-y-2">
            <label className="font-medium text-sm">Association</label>
            <select 
              className="w-full px-3 py-2 border rounded-md"
              value={selectedAssociationId} 
              onChange={(e) => handleAssociationChange(e.target.value)}
            >
              <option value="">Select Association</option>
              {associations.map(assoc => (
                <option key={assoc.id} value={assoc.id}>{assoc.name}</option>
              ))}
            </select>
            
            <Alert variant="default" className="mt-2">
              <InfoIcon className="h-4 w-4" />
              <AlertDescription>
                Selecting an association will filter the available properties
              </AlertDescription>
            </Alert>
          </div>
        )}
        
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
          properties={filteredProperties}
          selectedPropertyId={selectedPropertyId}
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
        <Button type="submit" disabled={isSubmitting || !selectedPropertyId}>
          {isSubmitting ? 'Saving...' : defaultValues.id ? 'Update' : 'Add'} Resident
        </Button>
      </DialogFooter>
    </form>
  );
};
