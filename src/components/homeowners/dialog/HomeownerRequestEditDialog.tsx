
import React from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { HomeownerRequest } from '@/types/homeowner-request-types';
import { toast } from 'sonner';
import { useSupabaseUpdate } from '@/hooks/supabase';
import RequestEditForm from './RequestEditForm';
import TooltipButton from '@/components/ui/tooltip-button';

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
    
    // Make sure we're using the database column names
    const updatedData: Partial<HomeownerRequest> = {
      title: values.title,
      description: values.description,
      status: values.status,
      priority: values.priority,
      type: values.type,
      assigned_to: values.assignedTo || null,
      association_id: values.associationId || null,
      property_id: values.propertyId || null,
      resident_id: values.residentId || null,
    };
    
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Request</DialogTitle>
        </DialogHeader>
        
        <RequestEditForm 
          request={request} 
          onSubmit={handleSubmit} 
          isPending={isPending}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
};

export default HomeownerRequestEditDialog;
