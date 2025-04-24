
import React from 'react';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { FormWorkflow } from '@/types/form-workflow-types';

interface WorkflowHeaderProps {
  workflow: FormWorkflow;
  isSaving: boolean;
  onUpdateWorkflow: (updates: Partial<FormWorkflow>) => void;
  onSave: () => Promise<void>;
}

const WorkflowHeader: React.FC<WorkflowHeaderProps> = ({
  workflow,
  isSaving,
  onUpdateWorkflow,
  onSave
}) => {
  return (
    <div className="flex justify-between items-center">
      <div>
        <h2 className="text-2xl font-bold">Form Submission Workflow</h2>
        <p className="text-muted-foreground">
          Define what happens when forms are submitted
        </p>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center space-x-2">
          <Switch 
            id="workflow-enabled"
            checked={workflow.isEnabled}
            onCheckedChange={(checked) => onUpdateWorkflow({ isEnabled: checked })}
          />
          <Label htmlFor="workflow-enabled">
            {workflow.isEnabled ? 'Enabled' : 'Disabled'}
          </Label>
        </div>
        <Button onClick={onSave} disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save Workflow'}
        </Button>
      </div>
    </div>
  );
};

export default WorkflowHeader;
