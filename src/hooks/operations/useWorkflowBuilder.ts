
import { useState } from 'react';
import { WorkflowType, WorkflowStep } from '@/types/workflow-types';

export const useWorkflowBuilder = (initialData?: {
  name: string;
  description: string;
  type: WorkflowType;
  steps: WorkflowStep[];
}) => {
  const [workflowData, setWorkflowData] = useState({
    name: initialData?.name || '',
    description: initialData?.description || '',
    type: initialData?.type || 'Governance' as WorkflowType,
    steps: initialData?.steps || []
  });

  const handleInputChange = (field: string, value: string) => {
    setWorkflowData({
      ...workflowData,
      [field]: value
    });
  };

  const updateWorkflowData = (updates: Partial<typeof workflowData>) => {
    setWorkflowData(prev => ({ ...prev, ...updates }));
  };

  return {
    workflowData,
    handleInputChange,
    updateWorkflowData,
    setWorkflowData
  };
};
