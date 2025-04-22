
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Workflow, ArrowRight } from 'lucide-react';
import FormWorkflowBuilder from './workflow/FormWorkflowBuilder';
import { useFormWorkflows } from '@/hooks/form-builder/useFormWorkflows';
import { FormWorkflow } from '@/types/form-workflow-types';

interface FormWorkflowIntegrationProps {
  formId: string;
}

const FormWorkflowIntegration: React.FC<FormWorkflowIntegrationProps> = ({ formId }) => {
  const [open, setOpen] = useState(false);
  const { workflows, isLoading, saveWorkflow } = useFormWorkflows(formId);
  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string | null>(null);
  
  const selectedWorkflow = selectedWorkflowId 
    ? workflows.find(w => w.id === selectedWorkflowId) 
    : workflows[0];
  
  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      setSelectedWorkflowId(null);
    }
  };
  
  const handleSave = async (workflow: FormWorkflow) => {
    const success = await saveWorkflow(workflow);
    if (success && !selectedWorkflowId) {
      setSelectedWorkflowId(workflow.id);
    }
    return success;
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Workflow className="h-5 w-5" />
          Form Workflows
        </CardTitle>
        <CardDescription>
          Define what happens when this form is submitted
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-6 text-muted-foreground">
            Loading workflows...
          </div>
        ) : workflows.length > 0 ? (
          <div className="space-y-4">
            {workflows.map(workflow => (
              <div key={workflow.id} className="border rounded-lg p-4 transition-all hover:border-primary cursor-pointer">
                <div className="flex justify-between">
                  <div>
                    <h3 className="font-medium flex items-center">
                      {workflow.name}
                      {!workflow.isEnabled && (
                        <span className="ml-2 text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded">
                          Disabled
                        </span>
                      )}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {workflow.steps.length} step{workflow.steps.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <Dialog open={open && selectedWorkflowId === workflow.id} onOpenChange={handleOpenChange}>
                    <DialogTrigger asChild>
                      <Button variant="ghost" onClick={() => setSelectedWorkflowId(workflow.id)}>
                        Edit <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Edit Workflow</DialogTitle>
                        <DialogDescription>
                          Configure what happens when this form is submitted
                        </DialogDescription>
                      </DialogHeader>
                      {selectedWorkflow && (
                        <FormWorkflowBuilder
                          formId={formId}
                          initialWorkflow={selectedWorkflow}
                          onSave={handleSave}
                        />
                      )}
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            ))}
            
            <Dialog open={open && !selectedWorkflowId} onOpenChange={handleOpenChange}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full" onClick={() => setSelectedWorkflowId(null)}>
                  Create New Workflow
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create New Workflow</DialogTitle>
                  <DialogDescription>
                    Define what happens when this form is submitted
                  </DialogDescription>
                </DialogHeader>
                <FormWorkflowBuilder
                  formId={formId}
                  onSave={handleSave}
                />
              </DialogContent>
            </Dialog>
          </div>
        ) : (
          <div className="text-center py-6 space-y-4 border rounded-lg bg-muted/20">
            <p className="text-muted-foreground">
              No workflows configured for this form yet
            </p>
            <Dialog open={open} onOpenChange={handleOpenChange}>
              <DialogTrigger asChild>
                <Button>
                  <Workflow className="mr-2 h-4 w-4" />
                  Create Workflow
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create Form Workflow</DialogTitle>
                  <DialogDescription>
                    Define what happens when this form is submitted
                  </DialogDescription>
                </DialogHeader>
                <FormWorkflowBuilder
                  formId={formId}
                  onSave={handleSave}
                />
              </DialogContent>
            </Dialog>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FormWorkflowIntegration;
