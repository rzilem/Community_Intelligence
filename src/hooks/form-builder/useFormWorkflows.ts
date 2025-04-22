
import { useState } from 'react';
import { useSupabaseQuery, useSupabaseCreate, useSupabaseUpdate } from '@/hooks/supabase';
import { FormWorkflow } from '@/types/form-workflow-types';
import { toast } from 'sonner';

export function useFormWorkflows(formId?: string) {
  const [isCreating, setIsCreating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const { data: workflows = [], isLoading, error, refetch } = useSupabaseQuery<FormWorkflow[]>(
    'form_workflows',
    {
      select: '*',
      filter: formId ? [{ column: 'formTemplateId', value: formId }] : [],
      order: { column: 'createdAt', ascending: false }
    },
    !!formId
  );

  const { mutate: createWorkflow } = useSupabaseCreate('form_workflows');
  const { mutate: updateWorkflow } = useSupabaseUpdate('form_workflows');

  const saveWorkflow = async (workflow: FormWorkflow): Promise<boolean> => {
    const isNew = !workflows.some(w => w.id === workflow.id);
    setIsCreating(isNew);
    setIsSaving(!isNew);

    try {
      if (isNew) {
        await createWorkflow(workflow);
        toast.success('Workflow created successfully');
      } else {
        await updateWorkflow({ 
          id: workflow.id,
          ...workflow
        });
        toast.success('Workflow updated successfully');
      }
      refetch();
      return true;
    } catch (error) {
      console.error('Error saving workflow:', error);
      toast.error('Failed to save workflow');
      return false;
    } finally {
      setIsCreating(false);
      setIsSaving(false);
    }
  };

  return {
    workflows,
    isLoading,
    error,
    isCreating,
    isSaving,
    saveWorkflow,
    refetch
  };
}
