
import React from 'react';
import { FormWorkflow, FormWorkflowStep } from '@/types/form-workflow-types';
import { WorkflowTabs } from './WorkflowTabs';

interface WorkflowContentProps {
  workflow: FormWorkflow;
  activeTab: string;
  selectedStepId: string | null;
  onTabChange: (tab: string) => void;
  onAddStep: () => void;
  onSelectStep: (stepId: string) => void;
  onUpdateStep: (step: FormWorkflowStep) => void;
  onDeleteStep: (stepId: string) => void;
  onUpdateWorkflow: (updates: Partial<FormWorkflow>) => void;
}

const WorkflowContent: React.FC<WorkflowContentProps> = ({
  workflow,
  activeTab,
  selectedStepId,
  onTabChange,
  onAddStep,
  onSelectStep,
  onUpdateStep,
  onDeleteStep,
  onUpdateWorkflow
}) => {
  return (
    <WorkflowTabs
      workflow={workflow}
      activeTab={activeTab}
      selectedStepId={selectedStepId}
      onTabChange={onTabChange}
      onAddStep={onAddStep}
      onSelectStep={onSelectStep}
      onUpdateStep={onUpdateStep}
      onDeleteStep={onDeleteStep}
      onUpdateWorkflow={onUpdateWorkflow}
    />
  );
};

export default WorkflowContent;
