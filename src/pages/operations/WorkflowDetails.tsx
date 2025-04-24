
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useWorkflows } from '@/hooks/operations/useWorkflows';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ChevronLeft, 
  Pause, 
  Play, 
  CheckCircle, 
  Circle,
  Edit, 
  Trash2, 
  Copy, 
  AlertCircle
} from 'lucide-react';
import PageTemplate from '@/components/layout/PageTemplate';
import { Progress } from '@/components/ui/progress';
import { WorkflowStep } from '@/types/workflow-types';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';

const WorkflowDetails = () => {
  const navigate = useNavigate();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  const { id } = useParams<{ id: string }>();
  const {
    useWorkflow,
    updateWorkflowStatus,
    removeWorkflow,
    completeWorkflowStep
  } = useWorkflows();

  const { workflow, isLoading, error } = useWorkflow(id);

  const handleBack = () => {
    navigate('/operations/workflows');
  };

  const handleDelete = async () => {
    if (!workflow?.id) return;
    const success = await removeWorkflow(workflow.id);
    if (success) {
      navigate('/operations/workflows');
    }
    setDeleteDialogOpen(false);
  };

  const handleEditWorkflow = () => {
    if (workflow?.id) {
      // Navigate to edit page (to be implemented)
      navigate(`/operations/workflows/edit/${workflow.id}`);
    }
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

  // Calculate progress percentage
  const calculateProgress = (steps: WorkflowStep[]) => {
    if (!steps || steps.length === 0) return 0;
    const completedSteps = steps.filter(s => s.isComplete).length;
    return Math.round((completedSteps / steps.length) * 100);
  };

  if (isLoading) {
    return (
      <PageTemplate title="Workflow Details" loading={true}>
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
      <PageTemplate title="Workflow Details">
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

  const progressPercentage = calculateProgress(workflow.steps);
  const isPaused = workflow.status === 'inactive';
  
  return (
    <PageTemplate title={workflow.name}>
      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <Button variant="outline" size="sm" onClick={handleBack}>
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          
          <div className="flex items-center gap-2">
            <Badge 
              variant={isPaused ? "outline" : "default"} 
              className={isPaused ? 'text-amber-500' : ''}
            >
              {isPaused ? 'Paused' : workflow.status}
            </Badge>
            <Badge variant="outline">{workflow.type}</Badge>
          </div>
        </div>
        
        <Card>
          <CardHeader>
            <div className="flex justify-between">
              <div>
                <CardTitle className="text-2xl">{workflow.name}</CardTitle>
                <CardDescription className="mt-2">{workflow.description || 'No description provided'}</CardDescription>
              </div>
              <div className="flex gap-2">
                {isPaused ? (
                  <Button variant="outline" size="sm" onClick={handleToggleStatus}>
                    <Play className="h-4 w-4 mr-1" />
                    Resume
                  </Button>
                ) : (
                  <Button variant="outline" size="sm" onClick={handleToggleStatus}>
                    <Pause className="h-4 w-4 mr-1" />
                    Pause
                  </Button>
                )}
                <Button variant="outline" size="sm">
                  <Copy className="h-4 w-4 mr-1" />
                  Duplicate
                </Button>
                <Button variant="ghost" size="sm" onClick={handleEditWorkflow}>
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                <Button variant="ghost" size="sm" className="text-red-500" onClick={() => setDeleteDialogOpen(true)}>
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Progress</span>
                <span className="text-sm text-muted-foreground">
                  {workflow.steps?.filter(s => s.isComplete).length || 0} / {workflow.steps?.length || 0} steps
                </span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
            </div>
            
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Workflow Steps</h3>
              <div className="space-y-4">
                {workflow.steps && workflow.steps.length > 0 ? (
                  workflow.steps.map((step, index) => (
                    <Card key={step.id} className={cn(
                      "border-l-4",
                      step.isComplete ? "border-l-green-500" : "border-l-gray-300"
                    )}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-3">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="rounded-full p-0 w-8 h-8"
                              disabled={step.isComplete}
                              onClick={() => handleCompleteStep(step.id)}
                            >
                              {step.isComplete ? (
                                <CheckCircle className="h-6 w-6 text-green-500" />
                              ) : (
                                <Circle className="h-6 w-6 text-gray-400" />
                              )}
                            </Button>
                            <div>
                              <p className="font-medium">{step.name}</p>
                              <p className="text-sm text-muted-foreground">{step.description}</p>
                            </div>
                          </div>
                          <Badge variant="outline">
                            Step {index + 1}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="text-center p-8 border rounded-lg">
                    <p className="text-muted-foreground">No steps have been added to this workflow</p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={handleBack}>Cancel</Button>
            <Button disabled={progressPercentage !== 100} className="bg-green-600 hover:bg-green-700">
              <CheckCircle className="h-4 w-4 mr-1" />
              Mark as Completed
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
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
            <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageTemplate>
  );
};

export default WorkflowDetails;
