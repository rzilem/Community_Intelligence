
import React from 'react';
import { FormWorkflow } from '@/types/form-workflow-types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface WorkflowSettingsProps {
  workflow: FormWorkflow;
  onChange: (updates: Partial<FormWorkflow>) => void;
}

const WorkflowSettings: React.FC<WorkflowSettingsProps> = ({
  workflow,
  onChange,
}) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>General Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="workflow-name">Workflow Name</Label>
              <Input
                id="workflow-name"
                value={workflow.name}
                onChange={(e) => onChange({ name: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="workflow-id" className="text-muted-foreground">Workflow ID</Label>
              <Input
                id="workflow-id"
                value={workflow.id}
                disabled
                className="bg-muted/30"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="workflow-description">Description</Label>
            <Textarea
              id="workflow-description"
              value={workflow.description || ''}
              onChange={(e) => onChange({ description: e.target.value })}
              placeholder="Describe what this workflow does"
              className="min-h-[100px]"
            />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Workflow Options</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="workflow-enabled">Enable Workflow</Label>
              <p className="text-sm text-muted-foreground">
                When enabled, this workflow will run automatically
              </p>
            </div>
            <Switch
              id="workflow-enabled"
              checked={workflow.isEnabled}
              onCheckedChange={(checked) => onChange({ isEnabled: checked })}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="workflow-logging">Enable Detailed Logging</Label>
              <p className="text-sm text-muted-foreground">
                Keep detailed logs of all workflow executions
              </p>
            </div>
            <Switch
              id="workflow-logging"
              checked={workflow.logging || false}
              onCheckedChange={(checked) => 
                onChange({ logging: checked })
              }
            />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Advanced Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="retry-failed">Retry Failed Actions</Label>
              <p className="text-sm text-muted-foreground">
                Automatically retry failed actions
              </p>
            </div>
            <Switch
              id="retry-failed"
              checked={workflow.retryFailed || false}
              onCheckedChange={(checked) => 
                onChange({ retryFailed: checked })
              }
            />
          </div>
          
          {(workflow.retryFailed || false) && (
            <div className="space-y-2 ml-6 border-l-2 pl-4">
              <Label htmlFor="max-retries">Maximum Retry Attempts</Label>
              <Input
                id="max-retries"
                type="number"
                min={1}
                max={5}
                value={workflow.maxRetries || 3}
                onChange={(e) => onChange({ maxRetries: Number(e.target.value) })}
                className="max-w-[100px]"
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default WorkflowSettings;
