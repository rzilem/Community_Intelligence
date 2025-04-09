
import { useSupabaseQuery, useSupabaseCreate, useSupabaseUpdate, useSupabaseDelete } from '@/hooks/supabase';
import { ProposalTemplate } from '@/types/proposal-types';
import { toast } from 'sonner';

export const useProposalTemplates = () => {
  const { 
    data: templates = [],
    isLoading,
    error,
    refetch
  } = useSupabaseQuery<ProposalTemplate[]>('proposal_templates', {
    order: { column: 'name', ascending: true }
  });

  const createTemplate = useSupabaseCreate<ProposalTemplate>('proposal_templates', {
    onSuccess: () => {
      toast.success('Template created successfully');
      refetch();
    }
  });

  const updateTemplate = useSupabaseUpdate<ProposalTemplate>('proposal_templates', {
    onSuccess: () => {
      toast.success('Template updated successfully');
      refetch();
    }
  });

  const deleteTemplate = useSupabaseDelete('proposal_templates', {
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
    refreshTemplates: refetch
  };
};
