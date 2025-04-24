
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Plus, Trash } from 'lucide-react';
import { FormWorkflowStep, FormWorkflowCondition, FormWorkflowAction } from '@/types/form-workflow-types';
import ConditionEditor from './ConditionEditor';
import ActionEditor from './ActionEditor';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface StepEditorProps {
  step: FormWorkflowStep;
  onUpdate: (step: FormWorkflowStep) => void;
  onDelete: () => void;
}

const StepEditor: React.FC<StepEditorProps> = ({ step, onUpdate, onDelete }) => {
  const handleBasicInfoChange = (updates: Partial<FormWorkflowStep>) => {
    onUpdate({
      ...step,
      ...updates,
    });
  };

  const handleAddCondition = () => {
    const newCondition: FormWorkflowCondition = {
      id: crypto.randomUUID(),
      field: '',
      operator: 'equals',
      value: '',
    };
    onUpdate({
      ...step,
      conditions: [...step.conditions, newCondition],
    });
  };

  const handleUpdateCondition = (condition: FormWorkflowCondition) => {
    onUpdate({
      ...step,
      conditions: step.conditions.map((c) =>
        c.id === condition.id ? condition : c
      ),
    });
  };

  const handleDeleteCondition = (conditionId: string) => {
    onUpdate({
      ...step,
      conditions: step.conditions.filter((c) => c.id !== conditionId),
    });
  };

  const handleAddAction = () => {
    const newAction: FormWorkflowAction = {
      id: crypto.randomUUID(),
      type: 'send_email',
      name: 'New Action',
      config: {},
      order: step.actions.length + 1,
    };
    onUpdate({
      ...step,
      actions: [...step.actions, newAction],
    });
  };

  const handleUpdateAction = (action: FormWorkflowAction) => {
    onUpdate({
      ...step,
      actions: step.actions.map((a) => (a.id === action.id ? action : a)),
    });
  };

  const handleDeleteAction = (actionId: string) => {
    onUpdate({
      ...step,
      actions: step.actions.filter((a) => a.id !== actionId),
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg font-medium">Step Configuration</CardTitle>
          <Button
            variant="destructive"
            size="sm"
            onClick={onDelete}
          >
            <Trash className="h-4 w-4 mr-2" />
            Delete Step
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="step-name">Name</Label>
            <Input
              id="step-name"
              value={step.name}
              onChange={(e) => handleBasicInfoChange({ name: e.target.value })}
              placeholder="Enter step name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="step-description">Description</Label>
            <Input
              id="step-description"
              value={step.description || ''}
              onChange={(e) =>
                handleBasicInfoChange({ description: e.target.value })
              }
              placeholder="Enter step description"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="step-trigger">Trigger</Label>
            <Select
              value={step.trigger}
              onValueChange={(value) =>
                handleBasicInfoChange({ trigger: value as any })
              }
            >
              <SelectTrigger id="step-trigger">
                <SelectValue placeholder="Select trigger" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="on_submit">On Submit</SelectItem>
                <SelectItem value="on_approval">On Approval</SelectItem>
                <SelectItem value="on_rejection">On Rejection</SelectItem>
                <SelectItem value="on_status_change">On Status Change</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="step-enabled"
              checked={step.isEnabled}
              onCheckedChange={(checked) =>
                handleBasicInfoChange({ isEnabled: checked })
              }
            />
            <Label htmlFor="step-enabled">Enable Step</Label>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg font-medium">Conditions</CardTitle>
          <Button size="sm" onClick={handleAddCondition}>
            <Plus className="h-4 w-4 mr-2" />
            Add Condition
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {step.conditions.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No conditions added yet. This step will always execute.
            </p>
          ) : (
            step.conditions.map((condition) => (
              <ConditionEditor
                key={condition.id}
                condition={condition}
                onChange={handleUpdateCondition}
                onDelete={() => handleDeleteCondition(condition.id)}
              />
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg font-medium">Actions</CardTitle>
          <Button size="sm" onClick={handleAddAction}>
            <Plus className="h-4 w-4 mr-2" />
            Add Action
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {step.actions.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No actions added yet. Add an action to make this step do something.
            </p>
          ) : (
            step.actions.map((action) => (
              <ActionEditor
                key={action.id}
                action={action}
                onChange={handleUpdateAction}
                onDelete={() => handleDeleteAction(action.id)}
              />
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StepEditor;
