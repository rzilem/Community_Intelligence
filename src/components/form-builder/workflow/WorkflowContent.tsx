
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FormWorkflow, FormWorkflowStep } from '@/types/form-workflow-types';
import { PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import WorkflowStepList from './WorkflowStepList';
import WorkflowStepEditor from './WorkflowStepEditor';
import WorkflowSettings from './WorkflowSettings';
import WorkflowTestPanel from './WorkflowTestPanel';

interface WorkflowContentProps {
  workflow: FormWorkflow;
  activeTab: string;
  selectedStepId: string | null;
  onUpdateWorkflow: (updates: Partial<FormWorkflow>) => void;
  onTabChange: (tab: string) => void;
  onAddStep: () => void;
  onSelectStep: (stepId: string) => void;
  onUpdateStep: (step: FormWorkflowStep) => void;
  onDeleteStep: (stepId: string) => void;
}

const WorkflowContent: React.FC<WorkflowContentProps> = ({
  workflow,
  activeTab,
  selectedStepId,
  onUpdateWorkflow,
  onTabChange,
  onAddStep,
  onSelectStep,
  onUpdateStep,
  onDeleteStep
}) => {
  const selectedStep = selectedStepId 
    ? workflow.steps.find(step => step.id === selectedStepId) 
    : null;

  return (
    <Card className="col-span-4">
      <CardHeader className="pb-2">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
          <div>
            <CardTitle>
              <Input
                value={workflow.name}
                onChange={(e) => onUpdateWorkflow({ name: e.target.value })}
                className="text-xl font-bold px-2 w-full max-w-md border-none"
                placeholder="Workflow Name"
              />
            </CardTitle>
          </div>
          <Input
            value={workflow.description || ''}
            onChange={(e) => onUpdateWorkflow({ description: e.target.value })}
            className="px-2 text-muted-foreground text-sm w-full max-w-md"
            placeholder="Add a description (optional)"
          />
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={onTabChange}>
          <TabsList className="mb-4">
            <TabsTrigger value="steps">Workflow Steps</TabsTrigger>
            <TabsTrigger value="editor" disabled={!selectedStepId}>Step Editor</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="test">Test Workflow</TabsTrigger>
          </TabsList>
          
          <TabsContent value="steps" className="space-y-4">
            {workflow.steps.length === 0 ? (
              <div className="text-center py-12 border rounded-lg bg-muted/20">
                <h3 className="text-lg font-medium mb-2">No Steps Added Yet</h3>
                <p className="text-muted-foreground mb-6">
                  Create your first workflow step to define what happens when forms are submitted
                </p>
                <Button onClick={onAddStep}>
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Add First Step
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <WorkflowStepList
                  steps={workflow.steps}
                  onSelectStep={onSelectStep}
                  onDeleteStep={onDeleteStep}
                />
                <div className="flex justify-center mt-4">
                  <Button onClick={onAddStep} variant="outline">
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Add Step
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="editor">
            {selectedStep ? (
              <WorkflowStepEditor 
                step={selectedStep}
                onChange={onUpdateStep}
                onDelete={() => onDeleteStep(selectedStep.id)}
              />
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Please select a step to edit
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="settings">
            <WorkflowSettings
              workflow={workflow}
              onChange={onUpdateWorkflow}
            />
          </TabsContent>
          
          <TabsContent value="test">
            <WorkflowTestPanel
              workflow={workflow}
              formId={workflow.formTemplateId}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default WorkflowContent;
