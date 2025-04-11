
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

interface HomeownerRequestEditDialogProps {
  request: HomeownerRequest | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const HomeownerRequestEditDialog: React.FC<HomeownerRequestEditDialogProps> = ({ 
  request, 
  open, 
  onOpenChange 
}) => {
  const { mutate: updateRequest, isPending } = useSupabaseUpdate<HomeownerRequest>(
    'homeowner_requests',
    {
      onSuccess: () => {
        toast.success('Request updated successfully');
        onOpenChange(false);
      },
    }
  );

  const handleSubmit = (values: any) => {
    if (!request) return;
    
    const updatedData: Partial<HomeownerRequest> = {
      title: values.title,
      description: values.description,
      status: values.status,
      priority: values.priority,
      type: values.type,
      assignedTo: values.assignedTo || null,
      associationId: values.associationId || null,
      propertyId: values.propertyId || null,
      residentId: values.residentId || null,
    };
    
    if (values.status === 'resolved' && request.status !== 'resolved') {
      updatedData.resolvedAt = new Date().toISOString();
    }
    
    if (values.status !== 'resolved' && request.status === 'resolved') {
      updatedData.resolvedAt = null;
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
