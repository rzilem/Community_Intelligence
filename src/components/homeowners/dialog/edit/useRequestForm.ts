
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { HomeownerRequest, HomeownerRequestStatus } from '@/types/homeowner-request-types';

const requestSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  status: z.string(),
  priority: z.string(),
  type: z.string(),
  assigned_to: z.string().optional().nullable(),
  property_id: z.string().optional().nullable(),
  resident_id: z.string().optional().nullable(),
  note: z.string().optional(),
  association_id: z.string().optional().nullable()
});

export const useRequestForm = (
  request: HomeownerRequest | null, 
  onClose?: (open: boolean) => void,
  onSuccess?: () => void
) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  
  const form = useForm<z.infer<typeof requestSchema>>({
    resolver: zodResolver(requestSchema),
    defaultValues: {
      title: request?.title || '',
      description: request?.description || '',
      status: request?.status || 'open',
      priority: request?.priority || 'medium',
      type: request?.type || 'general',
      assigned_to: request?.assigned_to || null,
      property_id: request?.property_id || null,
      resident_id: request?.resident_id || null,
      association_id: request?.association_id || null,
      note: ''
    }
  });
  
  const fetchComments = async () => {
    if (!request?.id) return;
    
    setLoadingComments(true);
    
    try {
      // Placeholder for actual API call to fetch comments
      // In a real implementation, you'd fetch comments from your database
      const mockComments = [
        {
          id: '1',
          content: 'This is a sample comment',
          created_at: new Date().toISOString(),
          user_id: 'user-1',
          parent_id: request.id,
          parent_type: 'homeowner_request',
          user: {
            first_name: 'John',
            last_name: 'Doe',
            email: 'john.doe@example.com'
          }
        }
      ];
      
      setComments(mockComments);
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoadingComments(false);
    }
  };
  
  const handleSubmit = async (values: z.infer<typeof requestSchema>) => {
    setIsSubmitting(true);
    
    try {
      // This is a placeholder for actual API call logic
      // In a real implementation, you'd update the request in your database
      
      const updatedRequest: HomeownerRequest = {
        ...request,
        ...values,
        id: request?.id || 'temp-id',
        updated_at: new Date().toISOString(),
        created_at: request?.created_at || new Date().toISOString(),
        association_id: values.association_id || request?.association_id || null,
        resolved_at: values.status === 'closed' ? new Date().toISOString() : null,
        tracking_number: request?.tracking_number || `REQ-${Math.floor(Math.random() * 10000)}`,
        attachments: request?.attachments || [],
        status: values.status as HomeownerRequestStatus
      };
      
      // If onSuccess callback is provided, call it
      if (onSuccess) {
        onSuccess();
      }
      
      // If onClose callback is provided, call it to close the dialog
      if (onClose) {
        onClose(false);
      }
      
      return updatedRequest;
    } catch (error) {
      console.error('Error submitting request form:', error);
      throw error instanceof Error ? error : new Error('Failed to submit request');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return {
    form,
    isSubmitting,
    comments,
    loadingComments,
    fetchComments,
    handleSubmit
  };
};
