
import { useState } from 'react';
import { WorkflowType } from '@/types/workflow-types';
import { useWorkflows } from './useWorkflows';
import { useNavigate } from 'react-router-dom';

export const useWorkflowDialog = () => {
  const navigate = useNavigate();
  const [newDialogOpen, setNewDialogOpen] = useState(false);
  const [workflowName, setWorkflowName] = useState('');
  const [workflowDescription, setWorkflowDescription] = useState('');
  const [workflowType, setWorkflowType] = useState<WorkflowType>('Governance');
  const [templateId, setTemplateId] = useState<string | null>(null);
  
  const {
    saveWorkflow,
    createFromTemplate,
    isLoading: isCreating
  } = useWorkflows();

  const handleCreate = async () => {
    if (!workflowName) return;

    let newWorkflowId: string | null = null;

    if (templateId) {
      newWorkflowId = await createFromTemplate(templateId);
    } else {
      const success = await saveWorkflow({
        name: workflowName,
        description: workflowDescription,
        type: workflowType,
        steps: [],
        is_template: false
      });
      
      if (success) {
        setWorkflowName('');
        setWorkflowDescription('');
        setWorkflowType('Governance');
      }
    }

    if (newWorkflowId) {
      setNewDialogOpen(false);
      navigate(`/operations/workflows/${newWorkflowId}`);
    }
  };

  return {
    newDialogOpen,
    setNewDialogOpen,
    workflowName,
    setWorkflowName,
    workflowDescription,
    setWorkflowDescription,
    workflowType,
    setWorkflowType,
    templateId,
    setTemplateId,
    handleCreate,
    isCreating
  };
};
