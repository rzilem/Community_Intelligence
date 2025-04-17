
import React from 'react';
import { 
  ResponsiveDialog,
  ResponsiveDialogContent, 
  ResponsiveDialogHeader, 
  ResponsiveDialogTitle
} from '@/components/ui/responsive-dialog';
import { HomeownerRequest } from '@/types/homeowner-request-types';
import { toast } from 'sonner';
import { useSupabaseUpdate } from '@/hooks/supabase';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth/useAuth';
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
  const { user } = useAuth();
  const { mutate: updateRequest, isPending } = useSupabaseUpdate<HomeownerRequest>(
    'homeowner_requests',
    {
      onSuccess: () => {
        toast.success('Request updated successfully');
        onOpenChange(false);
        if (onSuccess) {
          setTimeout(() => {
            onSuccess();
          }, 100);
        }
      },
      showErrorToast: true,
    }
  );

  const handleSubmit = async (values: any) => {
    if (!request) return;
    
    console.log('Submitting form values:', values);
    
    const updatedData: Partial<HomeownerRequest> = {
      title: values.title,
      description: values.description,
      status: values.status,
      priority: values.priority,
      type: values.type,
      assigned_to: values.assigned_to === 'unassigned' ? null : values.assigned_to,
      association_id: values.association_id === 'unassigned' ? null : values.association_id,
      property_id: values.property_id === 'unassigned' ? null : values.property_id,
      resident_id: values.resident_id === 'unassigned' ? null : values.resident_id
    };
    
    if (values.status === 'resolved' && request.status !== 'resolved') {
      updatedData.resolved_at = new Date().toISOString();
    }
    
    if (values.status !== 'resolved' && request.status === 'resolved') {
      updatedData.resolved_at = null;
    }
    
    // Handle note if provided
    if (values.note?.trim()) {
      try {
        const { error: commentError } = await supabase
          .from('comments')
          .insert({
            parent_id: request.id,
            parent_type: 'homeowner_request',
            content: values.note.trim(),
            user_id: user?.id || null,
          });
          
        if (commentError) {
          console.error('Error adding note:', commentError);
          toast.error('Failed to add note');
          return;
        }
      } catch (error) {
        console.error('Error adding note:', error);
        toast.error('Failed to add note');
        return;
      }
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
