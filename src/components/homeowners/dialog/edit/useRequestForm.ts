
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { useSupabaseUpdate } from '@/hooks/supabase';
import { supabase } from '@/integrations/supabase/client';
import { HomeownerRequest } from '@/types/homeowner-request-types';
import { useAuth } from '@/contexts/auth';

const formSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters" }),
  description: z.string().min(10, { message: "Description must be at least 10 characters" }),
  status: z.enum(['open', 'in-progress', 'resolved', 'closed']),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  type: z.enum(['maintenance', 'compliance', 'billing', 'general', 'amenity']),
  assigned_to: z.string().optional(),
  association_id: z.string().optional(),
  property_id: z.string().optional(),
  resident_id: z.string().optional(),
  note: z.string().optional(),
});

export const useRequestForm = (
  request: HomeownerRequest | null,
  onOpenChange: (open: boolean) => void,
  onSuccess?: () => void
) => {
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const { user } = useAuth();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: request?.title || '',
      description: request?.description || '',
      status: request?.status || 'open',
      priority: request?.priority || 'medium',
      type: request?.type || 'general',
      assigned_to: request?.assigned_to || 'unassigned',
      association_id: request?.association_id || 'unassigned',
      property_id: request?.property_id || 'unassigned',
      resident_id: request?.resident_id || 'unassigned',
      note: '',
    },
  });

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

  const fetchComments = async () => {
    if (!request) return;
    
    try {
      setLoadingComments(true);
      const { data, error } = await supabase
        .from('communications')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      setComments(data || []);
    } catch (error) {
      console.error('Error fetching comments:', error);
      toast.error('Failed to load comments');
    } finally {
      setLoadingComments(false);
    }
  };

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!request) return;
    
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
    
    if (values.note?.trim()) {
      try {
        const { error: commentError } = await supabase
          .from('communications')
          .insert({
            subject: `Note for request: ${request.title}`,
            content: values.note.trim(),
            user_id: user?.id || null,
          });
          
        if (commentError) throw commentError;
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

  return {
    form,
    isPending,
    comments,
    loadingComments,
    fetchComments,
    handleSubmit,
  };
};
