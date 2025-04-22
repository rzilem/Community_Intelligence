
import React, { useState } from 'react';
import { FormWorkflowStep, FormWorkflowAction, FormWorkflowCondition } from '@/types/form-workflow-types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { PlusCircle, Trash2 } from 'lucide-react';
import ActionEditor from './ActionEditor';
import ConditionEditor from './ConditionEditor';

interface WorkflowStepEditorProps {
  step: FormWorkflowStep;
  onChange: (step: FormWorkflowStep) => void;
  onDelete: () => void;
}

const WorkflowStepEditor: React.FC<WorkflowStepEditorProps> = ({
  step,
  onChange,
  onDelete
}) => {
  const [activeTab, setActiveTab] = useState('properties');
  const [selectedActionId, setSelectedActionId] = useState<string | null>(null);
  const [selectedConditionId, setSelectedConditionId] = useState<string | null>(null);

  const updateStep = (updates: Partial<FormWorkflowStep>) => {
    onChange({
      ...step,
      ...updates
    });
  };

  const handleAddAction = () => {
    const newAction: FormWorkflowAction = {
      id: crypto.randomUUID(),
      type: 'send_email',
      name: 'New Action',
      config: {},
      order: step.actions.length
    };
    
    updateStep({
      actions: [...step.actions, newAction]
    });
    
    setSelectedActionId(newAction.id);
  };

  const handleUpdateAction = (updatedAction: FormWorkflowAction) => {
    updateStep({
      actions: step.actions.map(action => 
        action.id === updatedAction.id ? updatedAction : action
      )
    });
  };

  const handleDeleteAction = (actionId: string) => {
    updateStep({
      actions: step.actions.filter(action => action.id !== actionId)
    });
    
    if (selectedActionId === actionId) {
      setSelectedActionId(null);
    }
  };

  const handleAddCondition = () => {
    const newCondition: FormWorkflowCondition = {
      id: crypto.randomUUID(),
      field: '',
      operator: 'equals',
      value: ''
    };
    
    updateStep({
      conditions: [...step.conditions, newCondition]
    });
    
    setSelectedConditionId(newCondition.id);
  };

  const handleUpdateCondition = (updatedCondition: FormWorkflowCondition) => {
    updateStep({
      conditions: step.conditions.map(condition => 
        condition.id === updatedCondition.id ? updatedCondition : condition
      )
    });
  };

  const handleDeleteCondition = (conditionId: string) => {
    updateStep({
      conditions: step.conditions.filter(condition => condition.id !== conditionId)
    });
    
    if (selectedConditionId === conditionId) {
      setSelectedConditionId(null);
    }
  };

  const selectedAction = selectedActionId 
    ? step.actions.find(action => action.id === selectedActionId) 
    : null;

  const selectedCondition = selectedConditionId
    ? step.conditions.find(condition => condition.id === selectedConditionId)
    : null;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Edit Step</h3>
        <div className="flex items-center gap-2">
          <Button variant="destructive" size="sm" onClick={onDelete}>
            Delete Step
          </Button>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="properties">Properties</TabsTrigger>
          <TabsTrigger value="conditions">Conditions</TabsTrigger>
          <TabsTrigger value="actions">Actions</TabsTrigger>
        </TabsList>
        
        <TabsContent value="properties" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Step Properties</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="step-name">Step Name</Label>
                <Input
                  id="step-name"
                  value={step.name}
                  onChange={(e) => updateStep({ name: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="step-description">Description (Optional)</Label>
                <Input
                  id="step-description"
                  value={step.description || ''}
                  onChange={(e) => updateStep({ description: e.target.value })}
                  placeholder="Enter a description for this step"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="trigger">Trigger Event</Label>
                <Select
                  value={step.trigger}
                  onValueChange={(value) => updateStep({ trigger: value as any })}
                >
                  <SelectTrigger id="trigger">
                    <SelectValue placeholder="Select a trigger" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="on_submit">When Form is Submitted</SelectItem>
                    <SelectItem value="on_approval">When Form is Approved</SelectItem>
                    <SelectItem value="on_rejection">When Form is Rejected</SelectItem>
                    <SelectItem value="on_status_change">When Status Changes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center space-x-2 pt-2">
                <Switch
                  id="step-enabled"
                  checked={step.isEnabled}
                  onCheckedChange={(checked) => updateStep({ isEnabled: checked })}
                />
                <Label htmlFor="step-enabled" className="cursor-pointer">
                  {step.isEnabled ? 'Step Enabled' : 'Step Disabled'}
                </Label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="conditions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Conditions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {step.conditions.length === 0 ? (
                <div className="text-center py-6 border rounded-lg bg-muted/20">
                  <p className="text-muted-foreground mb-4">
                    No conditions defined. This step will run for all form submissions.
                  </p>
                  <Button onClick={handleAddCondition}>
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Add Condition
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {step.conditions.map((condition) => (
                    <div 
                      key={condition.id}
                      className={`p-4 border rounded-lg cursor-pointer ${
                        selectedConditionId === condition.id ? 'border-primary' : ''
                      }`}
                      onClick={() => setSelectedConditionId(condition.id)}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-medium">
                            {condition.field || 'No field selected'}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {condition.operator} {String(condition.value)}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteCondition(condition.id);
                          }}
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  
                  <Button onClick={handleAddCondition} variant="outline" className="w-full">
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Add Condition
                  </Button>
                  
                  {selectedCondition && (
                    <>
                      <Separator />
                      <ConditionEditor
                        condition={selectedCondition}
                        onChange={handleUpdateCondition}
                        onDelete={() => handleDeleteCondition(selectedCondition.id)}
                      />
                    </>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="actions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {step.actions.length === 0 ? (
                <div className="text-center py-6 border rounded-lg bg-muted/20">
                  <p className="text-muted-foreground mb-4">
                    No actions defined. Add an action to specify what happens when this step is triggered.
                  </p>
                  <Button onClick={handleAddAction}>
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Add Action
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {step.actions.map((action) => (
                    <div 
                      key={action.id}
                      className={`p-4 border rounded-lg cursor-pointer ${
                        selectedActionId === action.id ? 'border-primary' : ''
                      }`}
                      onClick={() => setSelectedActionId(action.id)}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-medium">{action.name}</div>
                          <div className="text-sm text-muted-foreground">
                            Type: {action.type}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteAction(action.id);
                          }}
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  
                  <Button onClick={handleAddAction} variant="outline" className="w-full">
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Add Action
                  </Button>
                  
                  {selectedAction && (
                    <>
                      <Separator />
                      <ActionEditor
                        action={selectedAction}
                        onChange={handleUpdateAction}
                        onDelete={() => handleDeleteAction(selectedAction.id)}
                      />
                    </>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WorkflowStepEditor;
