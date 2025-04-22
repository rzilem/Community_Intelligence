
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { HomeownerRequest } from '@/types/homeowner-request-types';

const requestSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  status: z.string(),
  priority: z.string(),
  type: z.string(),
  assigned_to: z.string().optional().nullable(),
  property_id: z.string().optional().nullable(),
  resident_id: z.string().optional().nullable(),
  note: z.string().optional()
});

export const useRequestForm = (request: HomeownerRequest | null) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
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
      note: ''
    }
  });
  
  const handleSubmit = async (
    values: z.infer<typeof requestSchema>, 
    onSuccess: (updatedRequest: HomeownerRequest) => void,
    onError: (error: Error) => void
  ) => {
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
        association_id: request?.association_id || null,
        resolved_at: values.status === 'closed' ? new Date().toISOString() : null,
        tracking_number: request?.tracking_number || `REQ-${Math.floor(Math.random() * 10000)}`,
        attachments: request?.attachments || []
      };
      
      onSuccess(updatedRequest);
    } catch (error) {
      console.error('Error submitting request form:', error);
      onError(error instanceof Error ? error : new Error('Failed to submit request'));
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return {
    form,
    isSubmitting,
    handleSubmit
  };
};
