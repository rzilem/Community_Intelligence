
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FormWorkflow, FormWorkflowStep } from '@/types/form-workflow-types';
import { PlusCircle, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import WorkflowStepList from './WorkflowStepList';
import WorkflowStepEditor from './WorkflowStepEditor';
import WorkflowSettings from './WorkflowSettings';
import WorkflowTestPanel from './WorkflowTestPanel';

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

  const selectedStep = selectedStepId 
    ? workflow.steps.find(step => step.id === selectedStepId) 
    : null;

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
              onCheckedChange={(checked) => handleUpdateWorkflow({ isEnabled: checked })}
            />
            <Label htmlFor="workflow-enabled">
              {workflow.isEnabled ? 'Enabled' : 'Disabled'}
            </Label>
          </div>
          <Button onClick={handleSaveWorkflow} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Workflow'}
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-4 gap-6">
        <Card className="col-span-4">
          <CardHeader className="pb-2">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
              <div>
                <CardTitle>
                  <Input
                    value={workflow.name}
                    onChange={(e) => handleUpdateWorkflow({ name: e.target.value })}
                    className="text-xl font-bold px-2 w-full max-w-md border-none"
                    placeholder="Workflow Name"
                  />
                </CardTitle>
              </div>
              <Input
                value={workflow.description || ''}
                onChange={(e) => handleUpdateWorkflow({ description: e.target.value })}
                className="px-2 text-muted-foreground text-sm w-full max-w-md"
                placeholder="Add a description (optional)"
              />
            </div>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
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
                    <Button onClick={handleAddStep}>
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Add First Step
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <WorkflowStepList
                      steps={workflow.steps}
                      onSelectStep={(stepId) => {
                        setSelectedStepId(stepId);
                        setActiveTab('editor');
                      }}
                      onDeleteStep={handleDeleteStep}
                    />
                    <div className="flex justify-center mt-4">
                      <Button onClick={handleAddStep} variant="outline">
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
                    onChange={handleUpdateStep}
                    onDelete={() => handleDeleteStep(selectedStep.id)}
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
                  onChange={handleUpdateWorkflow}
                />
              </TabsContent>
              
              <TabsContent value="test">
                <WorkflowTestPanel
                  workflow={workflow}
                  formId={formId}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FormWorkflowBuilder;
