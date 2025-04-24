
import { useState } from 'react';
import { useWorkflows } from './useWorkflows';
import { toast } from 'sonner';

export const useWorkflowStep = (workflowId: string | undefined) => {
  const [isCompleting, setIsCompleting] = useState(false);
  const { completeWorkflowStep } = useWorkflows();

  const completeStep = async (stepId: string) => {
    if (!workflowId) {
      toast.error('No workflow ID provided');
      return;
    }

    setIsCompleting(true);
    try {
      await completeWorkflowStep(workflowId, stepId);
      toast.success('Step completed');
    } catch (error) {
      toast.error('Failed to complete step');
    } finally {
      setIsCompleting(false);
    }
  };

  return {
    completeStep,
    isCompleting
  };
};
