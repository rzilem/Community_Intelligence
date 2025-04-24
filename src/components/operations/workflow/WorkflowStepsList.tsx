
import React from 'react';
import WorkflowStepItem from './WorkflowStepItem';
import { WorkflowStep } from '@/types/workflow-types';
import { useWorkflowStep } from '@/hooks/operations/useWorkflowStep';

interface WorkflowStepsListProps {
  workflowId?: string;
  steps: WorkflowStep[];
}

const WorkflowStepsList: React.FC<WorkflowStepsListProps> = ({ 
  workflowId,
  steps 
}) => {
  const { completeStep } = useWorkflowStep(workflowId);

  if (!steps || steps.length === 0) {
    return (
      <div className="text-center p-8 border rounded-lg">
        <p className="text-muted-foreground">No steps have been added to this workflow</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {steps.map((step, index) => (
        <WorkflowStepItem
          key={step.id}
          step={step}
          index={index}
          onComplete={completeStep}
        />
      ))}
    </div>
  );
};

export default WorkflowStepsList;
