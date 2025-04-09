
import { useSupabaseQuery, useSupabaseCreate, useSupabaseUpdate, useSupabaseDelete } from '@/hooks/supabase';
import { EmailTemplate } from '@/types/email-types';
import { toast } from 'sonner';

export const useEmailTemplates = () => {
  const { 
    data: templates = [],
    isLoading,
    error,
    refetch
  } = useSupabaseQuery<EmailTemplate[]>('email_templates', {
    order: { column: 'name', ascending: true }
  });

  const createTemplate = useSupabaseCreate<EmailTemplate>('email_templates', {
    onSuccess: () => {
      toast.success('Email template created successfully');
      refetch();
    }
  });

  const updateTemplate = useSupabaseUpdate<EmailTemplate>('email_templates', {
    onSuccess: () => {
      toast.success('Email template updated successfully');
      refetch();
    }
  });

  const deleteTemplate = useSupabaseDelete('email_templates', {
    onSuccess: () => {
      toast.success('Email template deleted successfully');
      refetch();
    }
  });

  return {
    templates,
    isLoading,
    error,
    createTemplate: createTemplate.mutateAsync,
    updateTemplate: updateTemplate.mutateAsync,
    deleteTemplate: deleteTemplate.mutateAsync,
    refreshTemplates: refetch
  };
};
