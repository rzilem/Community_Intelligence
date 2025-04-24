
import { useState } from 'react';
import { useWorkflows } from './useWorkflows';
import { WorkflowStatus } from '@/types/workflow-types';
import { toast } from 'sonner';

export const useWorkflowStatus = (workflowId: string | undefined) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const { updateWorkflowStatus } = useWorkflows();

  const updateStatus = async (status: WorkflowStatus) => {
    if (!workflowId) {
      toast.error('No workflow ID provided');
      return false;
    }

    setIsUpdating(true);
    try {
      const success = await updateWorkflowStatus(workflowId, status);
      if (success) {
        toast.success(`Workflow ${status === 'inactive' ? 'paused' : status}`);
        return true;
      }
      return false;
    } catch (error) {
      toast.error('Failed to update workflow status');
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  return {
    updateStatus,
    isUpdating
  };
};
