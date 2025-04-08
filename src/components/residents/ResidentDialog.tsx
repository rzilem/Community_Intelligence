
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { ResidentWithProfile } from '@/types/app-types';
import { useSupabaseCreate, useSupabaseUpdate } from '@/hooks/supabase';
import { ResidentForm } from './ResidentForm';

interface ResidentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  resident: ResidentWithProfile | null;
}

export const ResidentDialog: React.FC<ResidentDialogProps> = ({ 
  open, 
  onOpenChange,
  resident 
}) => {
  const { currentAssociation } = useAuth();
  const isEditing = !!resident;
  
  const createResident = useSupabaseCreate<ResidentWithProfile>('residents');
  const updateResident = useSupabaseUpdate<ResidentWithProfile>('residents');

  const handleSubmit = async (data: Partial<ResidentWithProfile>) => {
    try {
      if (isEditing && resident) {
        await updateResident.mutateAsync({ 
          id: resident.id,
          data 
        });
      } else {
        await createResident.mutateAsync(data);
      }
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving resident:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Resident' : 'Add New Resident'}</DialogTitle>
          <DialogDescription>
            {isEditing 
              ? 'Update the details for this resident.' 
              : 'Enter the details for the new resident.'}
          </DialogDescription>
        </DialogHeader>
        
        <ResidentForm 
          defaultValues={resident || {
            resident_type: 'owner',
            name: '',
            email: '',
            is_primary: true
          }}
          onSubmit={handleSubmit}
          isSubmitting={createResident.isPending || updateResident.isPending}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
};
