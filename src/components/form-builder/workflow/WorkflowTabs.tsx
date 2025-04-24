
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FormWorkflow, FormWorkflowStep } from '@/types/form-workflow-types';
import { WorkflowStepsTab } from './tabs/WorkflowStepsTab';
import WorkflowSettings from './WorkflowSettings';
import WorkflowTestPanel from './WorkflowTestPanel';

interface WorkflowTabsProps {
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

export function WorkflowTabs({
  workflow,
  activeTab,
  selectedStepId,
  onTabChange,
  onAddStep,
  onSelectStep,
  onUpdateStep,
  onDeleteStep,
  onUpdateWorkflow
}: WorkflowTabsProps) {
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
          <WorkflowStepsTab
            workflow={workflow}
            selectedStepId={selectedStepId}
            onAddStep={onAddStep}
            onSelectStep={onSelectStep}
            onUpdateStep={onUpdateStep}
            onDeleteStep={onDeleteStep}
          />
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
}
