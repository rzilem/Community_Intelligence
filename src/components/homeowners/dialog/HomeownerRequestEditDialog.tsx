
import React from 'react';
import { 
  ResponsiveDialog,
  ResponsiveDialogContent, 
  ResponsiveDialogHeader, 
  ResponsiveDialogTitle
} from '@/components/ui/responsive-dialog';
import { Button } from '@/components/ui/button';
import { HomeownerRequest } from '@/types/homeowner-request-types';
import { toast } from 'sonner';
import { useSupabaseUpdate } from '@/hooks/supabase';
import RequestEditForm from './RequestEditForm';

interface HomeownerRequestEditDialogProps {
  request: HomeownerRequest | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const HomeownerRequestEditDialog: React.FC<HomeownerRequestEditDialogProps> = ({ 
  request, 
  open, 
  onOpenChange,
  onSuccess
}) => {
  const { mutate: updateRequest, isPending } = useSupabaseUpdate<HomeownerRequest>(
    'homeowner_requests',
    {
      onSuccess: () => {
        toast.success('Request updated successfully');
        onOpenChange(false);
        if (onSuccess) onSuccess();
      },
    }
  );

  const handleSubmit = (values: any) => {
    if (!request) return;
    
    console.log('Submitting form values:', values);
    
    // Make sure we're using the database column names
    const updatedData: Partial<HomeownerRequest> = {
      title: values.title,
      description: values.description,
      status: values.status,
      priority: values.priority,
      type: values.type,
      // Use the correct field names that match database columns
      assigned_to: values.assigned_to === 'unassigned' ? null : values.assigned_to || null,
      association_id: values.association_id === 'unassigned' ? null : values.association_id || null,
      property_id: values.property_id === 'unassigned' ? null : values.property_id || null,
      resident_id: values.resident_id === 'unassigned' ? null : values.resident_id || null,
    };
    
    console.log('Transformed data for update:', updatedData);
    
    if (values.status === 'resolved' && request.status !== 'resolved') {
      updatedData.resolved_at = new Date().toISOString();
    }
    
    if (values.status !== 'resolved' && request.status === 'resolved') {
      updatedData.resolved_at = null;
    }
    
    updateRequest({
      id: request.id,
      data: updatedData,
    });
  };

  return (
    <ResponsiveDialog open={open} onOpenChange={onOpenChange}>
      <ResponsiveDialogContent className="max-w-5xl w-[95%]">
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle>Edit Request</ResponsiveDialogTitle>
        </ResponsiveDialogHeader>
        
        <RequestEditForm 
          request={request} 
          onSubmit={handleSubmit} 
          isPending={isPending}
          onCancel={() => onOpenChange(false)}
        />
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
};

export default HomeownerRequestEditDialog;
