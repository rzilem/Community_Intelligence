
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FormWorkflow } from '@/types/form-workflow-types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface WorkflowSettingsProps {
  workflow: FormWorkflow;
  onUpdateWorkflow: (updates: Partial<FormWorkflow>) => void;
}

const WorkflowSettings: React.FC<WorkflowSettingsProps> = ({
  workflow,
  onUpdateWorkflow
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Workflow Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="workflow-name">Workflow Name</Label>
          <Input
            id="workflow-name"
            value={workflow.name}
            onChange={(e) => onUpdateWorkflow({ name: e.target.value })}
            placeholder="Enter workflow name"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="workflow-description">Description</Label>
          <Textarea
            id="workflow-description"
            value={workflow.description || ''}
            onChange={(e) => onUpdateWorkflow({ description: e.target.value })}
            placeholder="Enter workflow description"
            rows={4}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default WorkflowSettings;
