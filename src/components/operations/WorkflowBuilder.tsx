import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Plus, MoveUp, MoveDown, Trash2, Save } from 'lucide-react';
import { WorkflowType, WorkflowStep } from '@/types/workflow-types';

interface WorkflowBuilderProps {
  onSave: (data: { name: string; description: string; type: WorkflowType; steps: WorkflowStep[] }) => void;
  isSaving?: boolean;
}

const workflowTypes: WorkflowType[] = [
  'Financial',
  'Compliance',
  'Maintenance',
  'Resident Management',
  'Governance',
  'Communication'
];

const WorkflowBuilder: React.FC<WorkflowBuilderProps> = ({ onSave, isSaving }) => {
  const [activeTab, setActiveTab] = useState('info');
  const [expandedStepId, setExpandedStepId] = useState<string | null>(null);
  const [workflowData, setWorkflowData] = useState<{
    name: string;
    description: string;
    type: WorkflowType;
    steps: WorkflowStep[];
  }>({
    name: '',
    description: '',
    type: 'Governance',
    steps: []
  });

  const handleInputChange = (field: string, value: string) => {
    setWorkflowData({
      ...workflowData,
      [field]: value
    });
  };

  const handleStepChange = (stepId: string, field: string, value: string) => {
    const updatedSteps = workflowData.steps.map(step =>
      step.id === stepId ? { ...step, [field]: value } : step
    );
    setWorkflowData({ ...workflowData, steps: updatedSteps });
  };

  const addStep = () => {
    const newStep: WorkflowStep = {
      id: crypto.randomUUID(),
      name: `Step ${(workflowData.steps.length || 0) + 1}`,
      description: '',
      order: workflowData.steps.length,
      isComplete: false
    };
    setWorkflowData({ ...workflowData, steps: [...workflowData.steps, newStep] });
    setExpandedStepId(newStep.id);
  };

  const deleteStep = (stepId: string) => {
    const updatedSteps = workflowData.steps
      .filter(step => step.id !== stepId)
      .map((step, index) => ({ ...step, order: index }));
    setWorkflowData({ ...workflowData, steps: updatedSteps });
  };

  const moveStepUp = (stepId: string) => {
    const idx = workflowData.steps.findIndex(s => s.id === stepId);
    if (idx <= 0) return;
    const updatedSteps = [...workflowData.steps];
    const temp = updatedSteps[idx - 1];
    updatedSteps[idx - 1] = updatedSteps[idx];
    updatedSteps[idx] = temp;
    const reordered = updatedSteps.map((s, i) => ({ ...s, order: i }));
    setWorkflowData({ ...workflowData, steps: reordered });
  };

  const moveStepDown = (stepId: string) => {
    const idx = workflowData.steps.findIndex(s => s.id === stepId);
    if (idx < 0 || idx >= workflowData.steps.length - 1) return;
    const updatedSteps = [...workflowData.steps];
    const temp = updatedSteps[idx + 1];
    updatedSteps[idx + 1] = updatedSteps[idx];
    updatedSteps[idx] = temp;
    const reordered = updatedSteps.map((s, i) => ({ ...s, order: i }));
    setWorkflowData({ ...workflowData, steps: reordered });
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
        <Card>
          <CardHeader>
            <CardTitle>Workflow Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="wf-name">Name</Label>
              <Input id="wf-name" value={workflowData.name} onChange={e => handleInputChange('name', e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="wf-type">Type</Label>
              <Select value={workflowData.type} onValueChange={val => handleInputChange('type', val)}>
                <SelectTrigger id="wf-type">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {workflowTypes.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="wf-desc">Description</Label>
              <Textarea id="wf-desc" value={workflowData.description} onChange={e => handleInputChange('description', e.target.value)} rows={3} />
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="steps" className="mt-0">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Workflow Steps</CardTitle>
            <Button onClick={addStep} size="sm">
              <Plus className="mr-2 h-4 w-4" /> Add Step
            </Button>
          </CardHeader>
          <CardContent>
            {workflowData.steps.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No steps defined yet. Click "Add Step" to get started.</div>
            ) : (
              <Accordion type="single" collapsible value={expandedStepId || undefined} onValueChange={val => setExpandedStepId(val)}>
                {workflowData.steps.map((step, index) => (
                  <AccordionItem key={step.id} value={step.id}>
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex flex-1 items-center">
                        <span className="font-medium">{index + 1}. {step.name}</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4 pt-2">
                        <div className="grid gap-2">
                          <Label htmlFor={`step-name-${step.id}`}>Step Name</Label>
                          <Input id={`step-name-${step.id}`} value={step.name} onChange={e => handleStepChange(step.id, 'name', e.target.value)} />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor={`step-desc-${step.id}`}>Description</Label>
                          <Textarea id={`step-desc-${step.id}`} value={step.description || ''} onChange={e => handleStepChange(step.id, 'description', e.target.value)} rows={3} />
                        </div>
                        <div className="flex justify-between pt-2">
                          <div className="space-x-2">
                            <Button variant="outline" size="sm" onClick={() => moveStepUp(step.id)} disabled={index === 0}>
                              <MoveUp className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => moveStepDown(step.id)} disabled={index === workflowData.steps.length - 1}>
                              <MoveDown className="h-4 w-4" />
                            </Button>
                          </div>
                          <Button variant="destructive" size="sm" onClick={() => deleteStep(step.id)}>
                            <Trash2 className="h-4 w-4 mr-1" /> Delete Step
                          </Button>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </div>
  );
};

export default WorkflowBuilder;
