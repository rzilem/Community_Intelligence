
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ProposalTemplate } from '@/types/proposal-types';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

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
      const { data, error } = await supabase
        .from('proposal_templates')
        .select('*')
        .order('name');
        
      if (error) {
        throw new Error(error.message);
      }
      
      return (data || []).map((template: any) => ({
        id: template.id,
        name: template.name,
        description: template.description || '',
        content: template.content,
        folder_id: template.folder_id,
        attachments: template.attachments || [],
        created_at: template.created_at,
        updated_at: template.updated_at
      }));
    }
  });

  const createMutation = useMutation({
    mutationFn: async (template: Partial<ProposalTemplate>) => {
      // Convert attachments to a format compatible with JSON storage
      const attachmentsToInsert = template.attachments ? 
        JSON.parse(JSON.stringify(template.attachments)) : 
        [];
        
      const { data, error } = await supabase
        .from('proposal_templates')
        .insert({
          name: template.name || 'New Template',
          description: template.description,
          content: template.content || '<p>Enter your proposal content here</p>',
          folder_id: template.folder_id,
          attachments: attachmentsToInsert
        })
        .select()
        .single();
        
      if (error) throw new Error(error.message);
      
      // Parse the response and ensure proper typing
      const resultData = data as any;
      return {
        id: resultData.id,
        name: resultData.name,
        description: resultData.description || '',
        content: resultData.content,
        folder_id: resultData.folder_id,
        attachments: resultData.attachments || [],
        created_at: resultData.created_at,
        updated_at: resultData.updated_at
      } as ProposalTemplate;
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
      
      // Convert attachments to a format compatible with JSON storage
      const attachmentsToUpdate = template.attachments ? 
        JSON.parse(JSON.stringify(template.attachments)) : 
        undefined;
        
      const { data, error } = await supabase
        .from('proposal_templates')
        .update({
          name: template.name,
          description: template.description,
          content: template.content,
          folder_id: template.folder_id,
          attachments: attachmentsToUpdate
        })
        .eq('id', template.id)
        .select()
        .single();
        
      if (error) throw new Error(error.message);
      
      // Parse the response and ensure proper typing
      const resultData = data as any;
      return {
        id: resultData.id,
        name: resultData.name,
        description: resultData.description || '',
        content: resultData.content,
        folder_id: resultData.folder_id,
        attachments: resultData.attachments || [],
        created_at: resultData.created_at,
        updated_at: resultData.updated_at
      } as ProposalTemplate;
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
      const { error } = await supabase
        .from('proposal_templates')
        .delete()
        .eq('id', id);
        
      if (error) throw new Error(error.message);
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
