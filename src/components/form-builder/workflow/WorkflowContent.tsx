import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { FormWorkflow, FormWorkflowStep } from '@/types/form-workflow-types';
import WorkflowStepList from './WorkflowStepList';
import WorkflowSettings from './WorkflowSettings';
import WorkflowTestPanel from './WorkflowTestPanel';

interface WorkflowContentProps {
  workflow: FormWorkflow;
  activeTab: string;
  selectedStepId: string | null;
  onTabChange: (tab: string) => void;
  onAddStep: () => void;
  onSelectStep: (stepId: string) => void;
  onUpdateStep: (step: FormWorkflowStep) => void;
  onDeleteStep: (stepId: string) => void;
  onUpdateWorkflow: (updates: Partial<FormWorkflow>) => void;
}

const WorkflowContent: React.FC<WorkflowContentProps> = ({
  workflow,
  activeTab,
  selectedStepId,
  onTabChange,
  onAddStep,
  onSelectStep,
  onUpdateStep,
  onDeleteStep,
  onUpdateWorkflow
}) => {
  return (
    <>
      <div className="col-span-1">
        <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="steps">Steps</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="test">Test</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="col-span-3">
        <TabsContent value="steps" className="mt-0">
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
        </TabsContent>

        <TabsContent value="settings" className="mt-0">
          <WorkflowSettings workflow={workflow} onUpdateWorkflow={onUpdateWorkflow} />
        </TabsContent>

        <TabsContent value="test" className="mt-0">
          <WorkflowTestPanel workflow={workflow} />
        </TabsContent>
      </div>
    </>
  );
};

export default WorkflowContent;
