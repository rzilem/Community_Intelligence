
import { toast } from 'sonner';
import { OnboardingTemplate } from '@/types/onboarding-types';
import { useSupabaseQuery, useSupabaseCreate, useSupabaseUpdate, useSupabaseDelete } from '@/hooks/supabase';

export const useTemplateOperations = () => {
  const { 
    data: templates = [],
    isLoading,
    error,
    refetch
  } = useSupabaseQuery<OnboardingTemplate[]>('onboarding_templates', {
    order: { column: 'name', ascending: true }
  });

  const createTemplate = useSupabaseCreate<OnboardingTemplate>('onboarding_templates', {
    onSuccess: () => {
      toast.success('Template created successfully');
      refetch();
    },
    showSuccessToast: false,
    showErrorToast: true
  });

  const updateTemplate = useSupabaseUpdate<OnboardingTemplate>('onboarding_templates', {
    onSuccess: () => {
      toast.success('Template updated successfully');
      refetch();
    },
    showSuccessToast: false,
    showErrorToast: true
  });

  const deleteTemplate = useSupabaseDelete('onboarding_templates', {
    onSuccess: () => {
      toast.success('Template deleted successfully');
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
    isCreating: createTemplate.isPending,
    isUpdating: updateTemplate.isPending,
    isDeleting: deleteTemplate.isPending,
    refreshTemplates: refetch
  };
};
