
import React, { useState } from 'react';
import { FormWorkflow, FormWorkflowStep } from '@/types/form-workflow-types';
import WorkflowHeader from './WorkflowHeader';
import WorkflowError from './WorkflowError';
import WorkflowContent from './WorkflowContent';

interface FormWorkflowBuilderProps {
  formId: string;
  initialWorkflow?: FormWorkflow;
  onSave: (workflow: FormWorkflow) => Promise<void>;
}

const FormWorkflowBuilder: React.FC<FormWorkflowBuilderProps> = ({
  formId,
  initialWorkflow,
  onSave
}) => {
  const [activeTab, setActiveTab] = useState('steps');
  const [workflow, setWorkflow] = useState<FormWorkflow>(
    initialWorkflow || {
      id: crypto.randomUUID(),
      name: 'New Workflow',
      description: '',
      formTemplateId: formId,
      steps: [],
      isEnabled: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  );
  const [selectedStepId, setSelectedStepId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddStep = () => {
    const newStep: FormWorkflowStep = {
      id: crypto.randomUUID(),
      name: `Step ${workflow.steps.length + 1}`,
      description: '',
      trigger: 'on_submit',
      conditions: [],
      actions: [],
      isEnabled: true
    };
    
    setWorkflow(prev => ({
      ...prev,
      steps: [...prev.steps, newStep],
      updatedAt: new Date().toISOString()
    }));
    
    setSelectedStepId(newStep.id);
    setActiveTab('editor');
  };

  const handleUpdateStep = (updatedStep: FormWorkflowStep) => {
    setWorkflow(prev => ({
      ...prev,
      steps: prev.steps.map(step => 
        step.id === updatedStep.id ? updatedStep : step
      ),
      updatedAt: new Date().toISOString()
    }));
  };

  const handleDeleteStep = (stepId: string) => {
    setWorkflow(prev => ({
      ...prev,
      steps: prev.steps.filter(step => step.id !== stepId),
      updatedAt: new Date().toISOString()
    }));
    
    if (selectedStepId === stepId) {
      setSelectedStepId(null);
      setActiveTab('steps');
    }
  };

  const handleUpdateWorkflow = (updates: Partial<FormWorkflow>) => {
    setWorkflow(prev => ({
      ...prev,
      ...updates,
      updatedAt: new Date().toISOString()
    }));
  };

  const handleSaveWorkflow = async () => {
    try {
      setIsSaving(true);
      setError(null);
      await onSave(workflow);
    } catch (err) {
      console.error('Error saving workflow:', err);
      setError('Failed to save workflow. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <WorkflowHeader
        workflow={workflow}
        isSaving={isSaving}
        onUpdateWorkflow={handleUpdateWorkflow}
        onSave={handleSaveWorkflow}
      />

      <WorkflowError error={error} />

      <div className="grid grid-cols-4 gap-6">
        <WorkflowContent
          workflow={workflow}
          activeTab={activeTab}
          selectedStepId={selectedStepId}
          onUpdateWorkflow={handleUpdateWorkflow}
          onTabChange={setActiveTab}
          onAddStep={handleAddStep}
          onSelectStep={(stepId) => {
            setSelectedStepId(stepId);
            setActiveTab('editor');
          }}
          onUpdateStep={handleUpdateStep}
          onDeleteStep={handleDeleteStep}
        />
      </div>
    </div>
  );
};

export default FormWorkflowBuilder;
