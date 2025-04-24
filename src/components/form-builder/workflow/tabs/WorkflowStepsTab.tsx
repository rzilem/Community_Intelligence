
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { FormWorkflow, FormWorkflowStep } from '@/types/form-workflow-types';
import WorkflowStepList from '../WorkflowStepList';

interface WorkflowStepsTabProps {
  workflow: FormWorkflow;
  selectedStepId: string | null;
  onAddStep: () => void;
  onSelectStep: (stepId: string) => void;
  onUpdateStep: (step: FormWorkflowStep) => void;
  onDeleteStep: (stepId: string) => void;
}

export function WorkflowStepsTab({
  workflow,
  selectedStepId,
  onAddStep,
  onSelectStep,
  onUpdateStep,
  onDeleteStep
}: WorkflowStepsTabProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Workflow Steps</CardTitle>
        <Button onClick={onAddStep} size="sm">
          <Plus className="h-4 w-4 mr-1" /> Add Step
        </Button>
      </CardHeader>
      <CardContent>
        {workflow.steps.length === 0 ? (
          <div className="text-center p-8 text-muted-foreground">
            <p>No workflow steps defined.</p>
            <p className="text-sm">Add a step to begin defining your workflow.</p>
          </div>
        ) : (
          <WorkflowStepList
            steps={workflow.steps}
            selectedStepId={selectedStepId}
            onSelectStep={onSelectStep}
            onUpdateStep={onUpdateStep}
            onDeleteStep={onDeleteStep}
          />
        )}
      </CardContent>
    </Card>
  );
}
