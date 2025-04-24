
import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useWorkflows } from '@/hooks/operations/useWorkflows';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { ChevronLeft, CheckCircle, FileText, AlertCircle } from 'lucide-react';
import { AlertDialog, AlertDialogContent, AlertDialogAction, AlertDialogCancel, 
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle 
} from '@/components/ui/alert-dialog';
import PageTemplate from '@/components/layout/PageTemplate';
import WorkflowHeader from '@/components/operations/workflow/WorkflowHeader';
import WorkflowProgress from '@/components/operations/workflow/WorkflowProgress';
import WorkflowStepsList from '@/components/operations/workflow/WorkflowStepsList';

const WorkflowDetails = () => {
  const navigate = useNavigate();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const { id } = useParams<{ id: string }>();
  
  const {
    useWorkflow,
    updateWorkflowStatus,
    removeWorkflow,
    completeWorkflowStep,
    duplicateWorkflow
  } = useWorkflows();

  const { workflow, isLoading, error } = useWorkflow(id);

  const handleBack = () => navigate('/operations/workflows');
  
  const handleDelete = async () => {
    if (!workflow?.id) return;
    const success = await removeWorkflow(workflow.id);
    if (success) navigate('/operations/workflows');
    setDeleteDialogOpen(false);
  };

  const handleDuplicate = async () => {
    if (!workflow?.id) return;
    const newId = await duplicateWorkflow(workflow.id);
    if (newId) navigate(`/operations/workflows/${newId}`);
  };

  const handleEditWorkflow = () => {
    if (workflow?.id) navigate(`/operations/workflows/edit/${workflow.id}`);
  };

  const handleToggleStatus = async () => {
    if (!workflow?.id) return;
    const newStatus = workflow.status === 'inactive' ? 'active' : 'inactive';
    await updateWorkflowStatus(workflow.id, newStatus);
  };

  const handleCompleteStep = async (stepId: string) => {
    if (!workflow?.id) return;
    await completeWorkflowStep(workflow.id, stepId);
  };

  const handleMarkAsCompleted = async () => {
    if (!workflow?.id) return;
    await updateWorkflowStatus(workflow.id, 'completed');
  };

  if (isLoading) {
    return (
      <PageTemplate title="Workflow Details" icon={<FileText className="h-5 w-5" />}>
        <div className="flex flex-col gap-4">
          <div className="h-8 w-64 bg-gray-200 animate-pulse rounded"></div>
          <div className="h-24 bg-gray-200 animate-pulse rounded"></div>
          <div className="h-96 bg-gray-200 animate-pulse rounded"></div>
        </div>
      </PageTemplate>
    );
  }

  if (error || !workflow) {
    return (
      <PageTemplate title="Workflow Details" icon={<FileText className="h-5 w-5" />}>
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Error Loading Workflow</h2>
          <p className="text-muted-foreground mb-6">
            {error?.message || "This workflow doesn't exist or you don't have permission to view it."}
          </p>
          <Button onClick={handleBack}>Return to Workflows</Button>
        </div>
      </PageTemplate>
    );
  }

  const isPaused = workflow.status === 'inactive';
  const progressPercentage = workflow.steps?.filter(s => s.isComplete).length || 0;
  const isComplete = progressPercentage === workflow.steps?.length;
  
  return (
    <PageTemplate title={workflow.name} icon={<FileText className="h-5 w-5" />}>
      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <Button variant="outline" size="sm" onClick={handleBack}>
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
        </div>
        
        <Card>
          <CardContent className="p-6">
            <WorkflowHeader
              workflow={workflow}
              onEdit={handleEditWorkflow}
              onDelete={() => setDeleteDialogOpen(true)}
              onDuplicate={handleDuplicate}
              onToggleStatus={handleToggleStatus}
              isPaused={isPaused}
            />
            
            <WorkflowProgress steps={workflow.steps} />
            
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Workflow Steps</h3>
              <WorkflowStepsList 
                steps={workflow.steps}
                onCompleteStep={handleCompleteStep}
              />
            </div>
          </CardContent>
          
          <CardFooter className="flex justify-between p-6">
            <Button variant="outline" onClick={handleBack}>Cancel</Button>
            <Button 
              disabled={!isComplete} 
              className="bg-green-600 hover:bg-green-700"
              onClick={handleMarkAsCompleted}
            >
              <CheckCircle className="h-4 w-4 mr-1" />
              Mark as Completed
            </Button>
          </CardFooter>
        </Card>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this workflow?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the workflow
              and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={handleDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageTemplate>
  );
};

export default WorkflowDetails;
