
import { useState } from 'react';
import { useSupabaseQuery, useSupabaseCreate, useSupabaseUpdate, useSupabaseDelete } from '@/hooks/supabase';
import { Workflow } from '@/types/workflow-types';
import { toast } from 'sonner';

export function useWorkflows(templateOnly: boolean = false) {
  const [isLoading, setIsLoading] = useState(false);

  const { data: workflows = [], isLoading: isLoadingWorkflows, error, refetch } = useSupabaseQuery<Workflow[]>(
    'workflows',
    {
      select: '*',
      filter: templateOnly ? [{ column: 'is_template', value: true }] : [],
      order: { column: 'created_at', ascending: false }
    }
  );

  const { mutate: createWorkflow } = useSupabaseCreate('workflows');
  const { mutate: updateWorkflow } = useSupabaseUpdate('workflows');
  const { mutate: deleteWorkflow } = useSupabaseDelete('workflows');

  const saveWorkflow = async (workflow: Partial<Workflow>): Promise<boolean> => {
    setIsLoading(true);
    try {
      if (workflow.id) {
        await updateWorkflow({ 
          id: workflow.id, 
          data: workflow 
        });
        toast.success('Workflow updated successfully');
      } else {
        await createWorkflow(workflow);
        toast.success('Workflow created successfully');
      }
      refetch();
      return true;
    } catch (error) {
      console.error('Error saving workflow:', error);
      toast.error('Failed to save workflow');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const removeWorkflow = async (id: string): Promise<boolean> => {
    try {
      await deleteWorkflow(id);
      toast.success('Workflow deleted successfully');
      refetch();
      return true;
    } catch (error) {
      console.error('Error deleting workflow:', error);
      toast.error('Failed to delete workflow');
      return false;
    }
  };

  return {
    workflows,
    isLoading: isLoadingWorkflows || isLoading,
    error,
    saveWorkflow,
    removeWorkflow,
    refetch
  };
}
