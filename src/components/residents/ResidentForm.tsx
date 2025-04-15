
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ResidentWithProfile, Property } from '@/types/app-types';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

// Import refactored components
import { ResidentTypeSelect } from './form/ResidentTypeSelect';
import PropertySelect from './form/PropertySelect';
import { ResidentCheckboxField } from './form/ResidentCheckboxField';
import ResidentBasicFields from './form/ResidentBasicFields';
import ResidentDetailsFields from './form/ResidentDetailsFields';
import AssociationSelector from './form/AssociationSelector';

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
        <AssociationSelector 
          associations={associations}
          selectedAssociationId={selectedAssociationId}
          onAssociationChange={handleAssociationChange}
        />
        
        <ResidentBasicFields register={register} errors={errors} />
        
        <ResidentTypeSelect
          residentType={residentType || 'owner'}
          onChange={(value) => setValue('resident_type', value)}
        />
        
        <PropertySelect
          associationId={selectedAssociationId}
          propertyId={selectedPropertyId}
          onChange={(value) => setValue('property_id', value)}
        />
        
        <ResidentCheckboxField
          id="is_primary"
          label="Primary resident for this property"
          checked={!!isPrimary}
          onCheckedChange={(checked) => setValue('is_primary', checked)}
        />
        
        <ResidentDetailsFields register={register} />
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
