
import { WorkflowStep } from '@/types/workflow-types';
import type { UserRole } from '@/types/profile-types';

export const useWorkflowSteps = (
  steps: WorkflowStep[], 
  onStepsChange: (steps: WorkflowStep[]) => void
) => {
  const handleStepChange = (stepId: string, field: string, value: any) => {
    const updatedSteps = steps.map(step =>
      step.id === stepId ? { ...step, [field]: value } : step
    );
    onStepsChange(updatedSteps);
  };

  const addStep = () => {
    const newStep: WorkflowStep = {
      id: crypto.randomUUID(),
      name: `Step ${steps.length + 1}`,
      description: '',
      order: steps.length,
      isComplete: false,
      notifyRoles: [],
      autoExecute: false
    };
    onStepsChange([...steps, newStep]);
    return newStep.id;
  };

  const deleteStep = (stepId: string) => {
    const updatedSteps = steps
      .filter(step => step.id !== stepId)
      .map((step, index) => ({ ...step, order: index }));
    onStepsChange(updatedSteps);
  };

  const moveStepUp = (stepId: string) => {
    const idx = steps.findIndex(s => s.id === stepId);
    if (idx <= 0) return;
    const updatedSteps = [...steps];
    const temp = updatedSteps[idx - 1];
    updatedSteps[idx - 1] = updatedSteps[idx];
    updatedSteps[idx] = temp;
    const reordered = updatedSteps.map((s, i) => ({ ...s, order: i }));
    onStepsChange(reordered);
  };

  const moveStepDown = (stepId: string) => {
    const idx = steps.findIndex(s => s.id === stepId);
    if (idx < 0 || idx >= steps.length - 1) return;
    const updatedSteps = [...steps];
    const temp = updatedSteps[idx + 1];
    updatedSteps[idx + 1] = updatedSteps[idx];
    updatedSteps[idx] = temp;
    const reordered = updatedSteps.map((s, i) => ({ ...s, order: i }));
    onStepsChange(reordered);
  };

  const updateStepNotifyRoles = (stepId: string, roleId: UserRole, checked: boolean) => {
    const step = steps.find(s => s.id === stepId);
    if (!step) return;
    
    const current = step.notifyRoles || [];
    const updated = checked 
      ? [...current, roleId] 
      : current.filter(r => r !== roleId);
    
    handleStepChange(stepId, 'notifyRoles', updated);
  };

  return {
    handleStepChange,
    addStep,
    deleteStep,
    moveStepUp,
    moveStepDown,
    updateStepNotifyRoles
  };
};
