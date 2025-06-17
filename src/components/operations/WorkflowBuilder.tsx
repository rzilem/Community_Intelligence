
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Save } from 'lucide-react';
import { WorkflowType, WorkflowStep } from '@/types/workflow-types';
import { useWorkflowBuilder } from '@/hooks/operations/useWorkflowBuilder';
import WorkflowInfoForm from './workflow-builder/WorkflowInfoForm';
import WorkflowStepsManager from './workflow-builder/WorkflowStepsManager';

interface WorkflowBuilderProps {
  onSave: (data: { name: string; description: string; type: WorkflowType; steps: WorkflowStep[] }) => void;
  isSaving?: boolean;
}

const WorkflowBuilder: React.FC<WorkflowBuilderProps> = ({ onSave, isSaving }) => {
  const [activeTab, setActiveTab] = useState('info');
  const { workflowData, handleInputChange, updateWorkflowData } = useWorkflowBuilder();

  const handleStepsChange = (steps: WorkflowStep[]) => {
    updateWorkflowData({ steps });
  };

  const handleSave = () => {
    onSave(workflowData);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-auto">
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="info">Info</TabsTrigger>
            <TabsTrigger value="steps">Steps</TabsTrigger>
          </TabsList>
        </Tabs>
        <Button onClick={handleSave} disabled={isSaving}>
          <Save className="mr-2 h-4 w-4" />
          {isSaving ? 'Saving...' : 'Save Template'}
        </Button>
      </div>

      <TabsContent value="info" className="mt-0">
        <WorkflowInfoForm
          name={workflowData.name}
          description={workflowData.description}
          type={workflowData.type}
          onInputChange={handleInputChange}
        />
      </TabsContent>

      <TabsContent value="steps" className="mt-0">
        <WorkflowStepsManager
          steps={workflowData.steps}
          onStepsChange={handleStepsChange}
        />
      </TabsContent>
    </div>
  );
};

export default WorkflowBuilder;
