
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ProposalTemplate } from '@/types/proposal-types';
import { toast } from 'sonner';

export const useProposalTemplates = () => {
  const queryClient = useQueryClient();

  const { 
    data: templates = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['proposalTemplates'],
    queryFn: async (): Promise<ProposalTemplate[]> => {
      // Mock: Return sample templates
      const mockTemplates: ProposalTemplate[] = [
        {
          id: '1',
          name: 'Standard Management Proposal',
          description: 'Standard template for property management proposals',
          content: '<p>Welcome to our property management services...</p>',
          folder_id: null,
          attachments: [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '2',
          name: 'HOA Management Proposal',
          description: 'Template for HOA-specific management proposals',
          content: '<p>Specialized HOA management services...</p>',
          folder_id: null,
          attachments: [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];
      
      console.log('Mock: Fetching proposal templates');
      return mockTemplates;
    }
  });

  const createMutation = useMutation({
    mutationFn: async (template: Partial<ProposalTemplate>) => {
      // Mock: Create template
      const newTemplate: ProposalTemplate = {
        id: Date.now().toString(),
        name: template.name || 'New Template',
        description: template.description || '',
        content: template.content || '<p>Enter your proposal content here</p>',
        folder_id: template.folder_id || null,
        attachments: template.attachments || [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      console.log('Mock: Creating template', newTemplate);
      return newTemplate;
    },
    onSuccess: () => {
      toast.success('Template created successfully');
      queryClient.invalidateQueries({ queryKey: ['proposalTemplates'] });
    },
    onError: (error) => {
      toast.error(`Error creating template: ${error.message}`);
    }
  });

  const updateMutation = useMutation({
    mutationFn: async (template: Partial<ProposalTemplate>) => {
      if (!template.id) throw new Error('Template ID is required');
      
      // Mock: Update template
      const updatedTemplate: ProposalTemplate = {
        id: template.id,
        name: template.name || 'Updated Template',
        description: template.description || '',
        content: template.content || '',
        folder_id: template.folder_id || null,
        attachments: template.attachments || [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      console.log('Mock: Updating template', updatedTemplate);
      return updatedTemplate;
    },
    onSuccess: () => {
      toast.success('Template updated successfully');
      queryClient.invalidateQueries({ queryKey: ['proposalTemplates'] });
    },
    onError: (error) => {
      toast.error(`Error updating template: ${error.message}`);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      // Mock: Delete template
      console.log(`Mock: Deleting template ${id}`);
      return id;
    },
    onSuccess: () => {
      toast.success('Template deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['proposalTemplates'] });
    },
    onError: (error) => {
      toast.error(`Error deleting template: ${error.message}`);
    }
  });

  return {
    templates,
    isLoading,
    error,
    createTemplate: createMutation.mutate,
    updateTemplate: updateMutation.mutate,
    deleteTemplate: deleteMutation.mutate,
    refreshTemplates: refetch
  };
};
