
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Accordion } from '@/components/ui/accordion';
import { Plus } from 'lucide-react';
import { WorkflowStep } from '@/types/workflow-types';
import { useWorkflowSteps } from '@/hooks/operations/useWorkflowSteps';
import WorkflowStepCard from './WorkflowStepCard';

interface WorkflowStepsManagerProps {
  steps: WorkflowStep[];
  onStepsChange: (steps: WorkflowStep[]) => void;
}

const WorkflowStepsManager: React.FC<WorkflowStepsManagerProps> = ({
  steps,
  onStepsChange
}) => {
  const [expandedStepId, setExpandedStepId] = useState<string | null>(null);

  const {
    handleStepChange,
    addStep,
    deleteStep,
    moveStepUp,
    moveStepDown,
    updateStepNotifyRoles
  } = useWorkflowSteps(steps, onStepsChange);

  const handleAddStep = () => {
    const newStepId = addStep();
    setExpandedStepId(newStepId);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Workflow Steps</CardTitle>
        <Button onClick={handleAddStep} size="sm">
          <Plus className="mr-2 h-4 w-4" /> Add Step
        </Button>
      </CardHeader>
      <CardContent>
        {steps.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No steps defined yet. Click "Add Step" to get started.
          </div>
        ) : (
          <Accordion 
            type="single" 
            collapsible 
            value={expandedStepId || undefined} 
            onValueChange={val => setExpandedStepId(val)}
          >
            {steps.map((step, index) => (
              <WorkflowStepCard
                key={step.id}
                step={step}
                index={index}
                totalSteps={steps.length}
                onStepChange={handleStepChange}
                onMoveUp={moveStepUp}
                onMoveDown={moveStepDown}
                onDelete={deleteStep}
                onNotifyRoleChange={updateStepNotifyRoles}
              />
            ))}
          </Accordion>
        )}
      </CardContent>
    </Card>
  );
};

export default WorkflowStepsManager;
