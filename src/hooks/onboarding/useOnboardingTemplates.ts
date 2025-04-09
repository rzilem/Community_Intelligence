
import { useSupabaseQuery, useSupabaseCreate } from '@/hooks/supabase';
import { OnboardingTemplate } from '@/types/onboarding-types';
import { toast } from 'sonner';

export const useOnboardingTemplates = () => {
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
    }
  });

  return {
    templates,
    isLoading,
    error,
    createTemplate: createTemplate.mutateAsync,
    isCreating: createTemplate.isPending
  };
};
