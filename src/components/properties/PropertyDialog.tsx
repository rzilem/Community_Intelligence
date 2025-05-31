import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth';
import { Property } from '@/types/app-types';
import { useSupabaseCreate, useSupabaseUpdate } from '@/hooks/supabase';
import { PropertyForm } from './PropertyForm';

interface PropertyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  property: Property | null;
}

export const PropertyDialog: React.FC<PropertyDialogProps> = ({ 
  open, 
  onOpenChange,
  property 
}) => {
  const { currentAssociation } = useAuth();
  const isEditing = !!property;
  
  const createProperty = useSupabaseCreate<Property>('properties');
  const updateProperty = useSupabaseUpdate<Property>('properties');

  useEffect(() => {
    if (!open) return;
    // Additional logic can be added here if needed when the dialog opens
  }, [open]);

  const handleSubmit = async (data: Partial<Property>) => {
    try {
      if (isEditing && property) {
        await updateProperty.mutateAsync({ 
          id: property.id,
          data 
        });
      } else if (currentAssociation) {
        await createProperty.mutateAsync({
          ...data,
          association_id: currentAssociation.id
        });
      }
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving property:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Property' : 'Add New Property'}</DialogTitle>
          <DialogDescription>
            {isEditing 
              ? 'Update the details for this property.' 
              : 'Enter the details for the new property.'}
          </DialogDescription>
        </DialogHeader>
        
        <PropertyForm 
          defaultValues={property || {}}
          onSubmit={handleSubmit}
          isSubmitting={createProperty.isPending || updateProperty.isPending}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
};
