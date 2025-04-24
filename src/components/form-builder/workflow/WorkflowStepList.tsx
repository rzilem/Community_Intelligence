
import React from 'react';
import { FormWorkflowStep } from '@/types/form-workflow-types';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';

interface WorkflowStepListProps {
  steps: FormWorkflowStep[];
  selectedStepId: string | null;
  onSelectStep: (stepId: string) => void;
  onUpdateStep: (step: FormWorkflowStep) => void;
  onDeleteStep: (stepId: string) => void;
}

const WorkflowStepList: React.FC<WorkflowStepListProps> = ({
  steps,
  selectedStepId,
  onSelectStep,
  onUpdateStep,
  onDeleteStep
}) => {
  return (
    <div className="space-y-2">
      {steps.map((step) => (
        <div 
          key={step.id}
          className={`border p-3 rounded-md flex justify-between items-center cursor-pointer hover:bg-secondary/20 ${
            selectedStepId === step.id ? 'bg-secondary/30 border-primary' : ''
          }`}
          onClick={() => onSelectStep(step.id)}
        >
          <div>
            <div className="font-medium">{step.name}</div>
            <div className="text-sm text-muted-foreground">
              {step.description || 'No description'}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                step.isEnabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {step.isEnabled ? 'Enabled' : 'Disabled'}
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                {step.trigger}
              </span>
            </div>
          </div>
          <div className="flex gap-1">
            <Button
              size="icon"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                onSelectStep(step.id);
              }}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                onDeleteStep(step.id);
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default WorkflowStepList;
