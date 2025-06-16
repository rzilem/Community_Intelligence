
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Workflow, WorkflowStep } from '@/types/workflow-types';
import type { UserRole } from '@/types/profile-types';
import PageTemplate from '@/components/layout/PageTemplate';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2, ArrowLeft, Plus, Save, Trash2, MoveUp, MoveDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion';
import { Checkbox } from '@/components/ui/checkbox';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const WorkflowDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const roles: { id: UserRole; name: string }[] = [
    { id: 'admin', name: 'Administrator' },
    { id: 'manager', name: 'Manager' },
    { id: 'resident', name: 'Resident' },
    { id: 'maintenance', name: 'Maintenance' },
    { id: 'accountant', name: 'Accountant' },
    { id: 'treasurer', name: 'Treasurer' },
    { id: 'user', name: 'Basic User' }
  ];
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [workflowData, setWorkflowData] = useState<Partial<Workflow> | null>(null);
  const [expandedStepId, setExpandedStepId] = useState<string | null>(null);
  
  // Fetch workflow details
  const { data: workflow, isLoading, error } = useQuery({
    queryKey: ['workflow', id],
    queryFn: async () => {
      try {
        let query;
        // Check if this is a template or a regular workflow
        const templateCheck = await supabase
          .from('workflow_templates')
          .select('id')
          .eq('id', id)
          .single();
        
        if (templateCheck.data) {
          query = await supabase
            .from('workflow_templates')
            .select('*')
            .eq('id', id)
            .single();
        } else {
          query = await supabase
            .from('workflows')
            .select('*')
            .eq('id', id)
            .single();
        }
        
        const { data, error } = query;
        if (error) throw error;
        
        // Convert to our Workflow type
        const result: Workflow = {
          id: data.id,
          name: data.name,
          description: data.description || '',
          type: data.type,
          status: data.status,
          steps: data.steps || [],
          isTemplate: data.is_template,
          isPopular: data.is_popular || false
        };
        
        setWorkflowData(result);
        return result;
      } catch (err) {
        console.error('Error fetching workflow:', err);
        throw err;
      }
    },
    enabled: !!id,
  });
  
  // Update workflow mutation
  const updateWorkflow = useMutation({
    mutationFn: async (data: Partial<Workflow>) => {
      try {
        const isTemplate = data.isTemplate;
        const tableName = isTemplate ? 'workflow_templates' : 'workflows';
        
        const { error } = await supabase
          .from(tableName)
          .update({
            name: data.name,
            description: data.description,
            steps: data.steps,
            // Don't update these unless explicitly changed
            type: data.type,
            status: data.status,
          })
          .eq('id', id);
          
        if (error) throw error;
        
        return data;
      } catch (err) {
        console.error('Error updating workflow:', err);
        throw err;
      }
    },
    onSuccess: () => {
      toast.success('Workflow updated successfully');
      queryClient.invalidateQueries({ queryKey: ['workflow', id] });
      if (workflow?.isTemplate) {
        queryClient.invalidateQueries({ queryKey: ['workflowTemplates'] });
      } else {
        queryClient.invalidateQueries({ queryKey: ['activeWorkflows'] });
      }
    },
    onError: (err) => {
      toast.error(`Error updating workflow: ${err.message}`);
    }
  });
  
  // Delete workflow mutation
  const deleteWorkflow = useMutation({
    mutationFn: async () => {
      try {
        const isTemplate = workflow?.isTemplate;
        const tableName = isTemplate ? 'workflow_templates' : 'workflows';
        
        const { error } = await supabase
          .from(tableName)
          .delete()
          .eq('id', id);
          
        if (error) throw error;
        
        return true;
      } catch (err) {
        console.error('Error deleting workflow:', err);
        throw err;
      }
    },
    onSuccess: () => {
      toast.success('Workflow deleted successfully');
      navigate('/operations/workflows');
      if (workflow?.isTemplate) {
        queryClient.invalidateQueries({ queryKey: ['workflowTemplates'] });
      } else {
        queryClient.invalidateQueries({ queryKey: ['activeWorkflows'] });
      }
    },
    onError: (err) => {
      toast.error(`Error deleting workflow: ${err.message}`);
    }
  });
  
  // Update local workflow data
  const handleInputChange = (field: string, value: string) => {
    if (!workflowData) return;
    setWorkflowData({
      ...workflowData,
      [field]: value
    });
  };
  
  // Update step
  const handleStepChange = (stepId: string, field: string, value: any) => {
    if (!workflowData?.steps) return;
    
    const updatedSteps = workflowData.steps.map((step) => {
      if (step.id === stepId) {
        return { ...step, [field]: value };
      }
      return step;
    });
    
    setWorkflowData({
      ...workflowData,
      steps: updatedSteps
    });
  };
  
  // Add new step
  const addStep = () => {
    if (!workflowData) return;

    const newStep: WorkflowStep = {
      id: crypto.randomUUID(),
      name: `Step ${(workflowData.steps?.length || 0) + 1}`,
      description: '',
      order: (workflowData.steps?.length || 0),
      isComplete: false,
      notifyRoles: [],
      autoExecute: false
    };
    
    setWorkflowData({
      ...workflowData,
      steps: [...(workflowData.steps || []), newStep]
    });
    
    // Expand the newly added step
    setExpandedStepId(newStep.id);
  };
  
  // Delete step
  const deleteStep = (stepId: string) => {
    if (!workflowData?.steps) return;
    
    const updatedSteps = workflowData.steps
      .filter((step) => step.id !== stepId)
      .map((step, index) => ({
        ...step,
        order: index
      }));
    
    setWorkflowData({
      ...workflowData,
      steps: updatedSteps
    });
  };
  
  // Move step up
  const moveStepUp = (stepId: string) => {
    if (!workflowData?.steps) return;
    
    const stepIndex = workflowData.steps.findIndex((s) => s.id === stepId);
    if (stepIndex <= 0) return;
    
    const updatedSteps = [...workflowData.steps];
    const temp = updatedSteps[stepIndex];
    updatedSteps[stepIndex] = updatedSteps[stepIndex - 1];
    updatedSteps[stepIndex - 1] = temp;
    
    // Update order property
    const reorderedSteps = updatedSteps.map((step, index) => ({
      ...step,
      order: index
    }));
    
    setWorkflowData({
      ...workflowData,
      steps: reorderedSteps
    });
  };
  
  // Move step down
  const moveStepDown = (stepId: string) => {
    if (!workflowData?.steps) return;
    
    const stepIndex = workflowData.steps.findIndex((s) => s.id === stepId);
    if (stepIndex >= workflowData.steps.length - 1) return;
    
    const updatedSteps = [...workflowData.steps];
    const temp = updatedSteps[stepIndex];
    updatedSteps[stepIndex] = updatedSteps[stepIndex + 1];
    updatedSteps[stepIndex + 1] = temp;
    
    // Update order property
    const reorderedSteps = updatedSteps.map((step, index) => ({
      ...step,
      order: index
    }));
    
    setWorkflowData({
      ...workflowData,
      steps: reorderedSteps
    });
  };
  
  // Save changes
  const saveChanges = () => {
    if (!workflowData) return;
    updateWorkflow.mutate(workflowData);
  };
  
  // Handle delete confirmation
  const confirmDelete = () => {
    setIsDeleteDialogOpen(true);
  };
  
  // Perform delete
  const handleDelete = () => {
    deleteWorkflow.mutate();
    setIsDeleteDialogOpen(false);
  };
  
  if (isLoading) {
    return (
      <PageTemplate title="Workflow Details" icon={<Loader2 className="h-8 w-8 animate-spin" />}>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading workflow details...</span>
        </div>
      </PageTemplate>
    );
  }
  
  if (error || !workflow) {
    return (
      <PageTemplate title="Workflow Details" icon={<ArrowLeft className="h-8 w-8" />}>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <h3 className="text-lg font-semibold mb-2">Error Loading Workflow</h3>
              <p className="text-muted-foreground mb-4">
                {error ? `${error}` : 'Could not find the requested workflow.'}
              </p>
              <Button onClick={() => navigate('/operations/workflows')}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Workflows
              </Button>
            </div>
          </CardContent>
        </Card>
      </PageTemplate>
    );
  }
  
  return (
    <PageTemplate 
      title={workflowData?.name || workflow.name} 
      icon={<ArrowLeft className="h-8 w-8 cursor-pointer" onClick={() => navigate('/operations/workflows')} />}
      description={workflowData?.description || workflow.description}
      actions={
        <div className="flex gap-2">
          <Button variant="outline" onClick={confirmDelete}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
          <Button onClick={saveChanges} disabled={updateWorkflow.isPending}>
            <Save className="mr-2 h-4 w-4" />
            {updateWorkflow.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Workflow Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input 
                  id="name" 
                  value={workflowData?.name || workflow.name} 
                  onChange={(e) => handleInputChange('name', e.target.value)}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description" 
                  value={workflowData?.description || workflow.description} 
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={3}
                />
              </div>
              
              <div className="flex gap-2 items-center">
                <Label>Type:</Label>
                <Badge variant="outline">{workflow.type}</Badge>
              </div>
              
              <div className="flex gap-2 items-center">
                <Label>Status:</Label>
                <Badge 
                  variant={workflow.status === 'active' ? 'default' : 
                           workflow.status === 'template' ? 'secondary' : 
                           'outline'}
                >
                  {workflow.status}
                </Badge>
              </div>
              
              <div className="flex gap-2 items-center">
                <Label>Template:</Label>
                <Badge variant="outline">{workflow.isTemplate ? 'Yes' : 'No'}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Workflow Steps</CardTitle>
            <Button onClick={addStep}>
              <Plus className="mr-2 h-4 w-4" />
              Add Step
            </Button>
          </CardHeader>
          <CardContent>
            {(!workflowData?.steps || workflowData.steps.length === 0) ? (
              <div className="text-center py-8 text-muted-foreground">
                No steps defined yet. Click "Add Step" to get started.
              </div>
            ) : (
              <Accordion
                type="single"
                collapsible
                value={expandedStepId || undefined}
                onValueChange={(value) => setExpandedStepId(value)}
              >
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
                          <Input 
                            id={`step-name-${step.id}`} 
                            value={step.name} 
                            onChange={(e) => handleStepChange(step.id, 'name', e.target.value)}
                          />
                        </div>
                        
                        <div className="grid gap-2">
                          <Label htmlFor={`step-description-${step.id}`}>Description</Label>
                          <Textarea
                            id={`step-description-${step.id}`}
                            value={step.description || ''}
                            onChange={(e) => handleStepChange(step.id, 'description', e.target.value)}
                            rows={3}
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label>Notify Roles</Label>
                          <div className="flex flex-wrap gap-2">
                            {roles.map(role => (
                              <div key={role.id} className="flex items-center space-x-2">
                                <Checkbox
                                  id={`detail-notify-${step.id}-${role.id}`}
                                  checked={step.notifyRoles?.includes(role.id) || false}
                                  onCheckedChange={checked => {
                                    const current = step.notifyRoles || [];
                                    const updated = checked ? [...current, role.id] : current.filter(r => r !== role.id);
                                    handleStepChange(step.id, 'notifyRoles', updated);
                                  }}
                                />
                                <label htmlFor={`detail-notify-${step.id}-${role.id}`} className="text-sm">
                                  {role.name}
                                </label>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={`detail-auto-${step.id}`}
                            checked={step.autoExecute || false}
                            onCheckedChange={checked => handleStepChange(step.id, 'autoExecute', checked)}
                          />
                          <Label htmlFor={`detail-auto-${step.id}`}>Auto Execute</Label>
                        </div>
                        
                        <div className="flex justify-between pt-2">
                          <div className="space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => moveStepUp(step.id)}
                              disabled={index === 0}
                            >
                              <MoveUp className="h-4 w-4" />
                              <span className="sr-only">Move Up</span>
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => moveStepDown(step.id)}
                              disabled={index === workflowData.steps.length - 1}
                            >
                              <MoveDown className="h-4 w-4" />
                              <span className="sr-only">Move Down</span>
                            </Button>
                          </div>
                          <Button 
                            variant="destructive" 
                            size="sm" 
                            onClick={() => deleteStep(step.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete Step
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
      </div>
      
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this workflow and all of its steps.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete} 
              className="bg-destructive text-destructive-foreground"
            >
              {deleteWorkflow.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete Workflow'  
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageTemplate>
  );
};

export default WorkflowDetails;
