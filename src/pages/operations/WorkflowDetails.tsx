import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageTemplate from '@/components/layout/PageTemplate';
import { 
  ArrowLeft,
  Workflow as WorkflowIcon,
  Calendar,
  CheckCircle2,
  Clock,
  User,
  BarChart3,
  PauseCircle,
  PlayCircle,
  XCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Workflow, WorkflowStep, WorkflowType, WorkflowStatus } from '@/types/workflow-types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';

const WorkflowDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [workflow, setWorkflow] = useState<Workflow | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('steps');

  useEffect(() => {
    if (!id) return;

    const fetchWorkflow = async () => {
      try {
        const { data: workflowData, error } = await supabase
          .from('workflows')
          .select('*')
          .eq('id', id)
          .single();

        if (error) {
          toast.error(`Error loading workflow: ${error.message}`);
          return;
        }

        setWorkflow({
          id: workflowData.id,
          name: workflowData.name,
          description: workflowData.description || '',
          type: workflowData.type as WorkflowType,
          status: workflowData.status as WorkflowStatus,
          steps: Array.isArray(workflowData.steps) ? workflowData.steps as WorkflowStep[] : [],
          isTemplate: Boolean(workflowData.is_template),
          isPopular: false
        });
      } catch (error) {
        console.error('Error fetching workflow details:', error);
        toast.error('Failed to load workflow details');
      } finally {
        setLoading(false);
      }
    };

    fetchWorkflow();
  }, [id]);

  const handleStatusChange = async (newStatus: 'active' | 'inactive') => {
    if (!workflow) return;

    try {
      const { error } = await supabase
        .from('workflows')
        .update({ status: newStatus })
        .eq('id', workflow.id);

      if (error) {
        throw error;
      }

      setWorkflow({ ...workflow, status: newStatus as WorkflowStatus });
      toast.success(`Workflow ${newStatus === 'active' ? 'activated' : 'paused'} successfully`);
    } catch (error) {
      console.error('Error updating workflow status:', error);
      toast.error('Failed to update workflow status');
    }
  };

  const handleCancel = async () => {
    if (!workflow) return;

    const confirmed = window.confirm('Are you sure you want to cancel this workflow? This action cannot be undone.');
    
    if (!confirmed) return;

    try {
      const { error } = await supabase
        .from('workflows')
        .delete()
        .eq('id', workflow.id);

      if (error) {
        throw error;
      }

      toast.success('Workflow cancelled successfully');
      navigate('/operations/workflows');
    } catch (error) {
      console.error('Error cancelling workflow:', error);
      toast.error('Failed to cancel workflow');
    }
  };

  const handleCompleteStep = async (stepId: string) => {
    if (!workflow) return;
    
    const updatedSteps = workflow.steps.map(step => 
      step.id === stepId ? { ...step, isComplete: true } : step
    );
    
    try {
      const { error } = await supabase
        .from('workflows')
        .update({ steps: updatedSteps })
        .eq('id', workflow.id);

      if (error) {
        throw error;
      }

      setWorkflow({ ...workflow, steps: updatedSteps });
      toast.success('Step marked as complete');
    } catch (error) {
      console.error('Error updating step:', error);
      toast.error('Failed to update step');
    }
  };

  if (loading) {
    return (
      <PageTemplate 
        title="Workflow Details"
        icon={<WorkflowIcon className="h-8 w-8" />}
        description="Loading workflow details..."
        actions={
          <Button variant="outline" onClick={() => navigate('/operations/workflows')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Workflows
          </Button>
        }
      >
        <div className="space-y-6">
          <Skeleton className="w-full h-12" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Skeleton className="w-full h-32" />
            <Skeleton className="w-full h-32" />
            <Skeleton className="w-full h-32" />
          </div>
          <Skeleton className="w-full h-[400px]" />
        </div>
      </PageTemplate>
    );
  }

  if (!workflow) {
    return (
      <PageTemplate 
        title="Workflow Not Found"
        icon={<WorkflowIcon className="h-8 w-8" />}
        description="The requested workflow could not be found"
        actions={
          <Button variant="outline" onClick={() => navigate('/operations/workflows')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Workflows
          </Button>
        }
      >
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <p className="text-muted-foreground mb-4">
              The workflow you're looking for doesn't exist or you don't have permission to view it.
            </p>
            <Button onClick={() => navigate('/operations/workflows')}>
              Return to Workflows
            </Button>
          </CardContent>
        </Card>
      </PageTemplate>
    );
  }

  const completedSteps = workflow.steps.filter(step => step.isComplete).length;
  const totalSteps = workflow.steps.length;
  const progress = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

  return (
    <PageTemplate 
      title={workflow.name}
      icon={<WorkflowIcon className="h-8 w-8" />}
      description={workflow.description || "Workflow details and progress tracking"}
      actions={
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate('/operations/workflows')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          
          {workflow.status === 'active' ? (
            <Button variant="outline" onClick={() => handleStatusChange('inactive')}>
              <PauseCircle className="mr-2 h-4 w-4" />
              Pause Workflow
            </Button>
          ) : workflow.status === 'inactive' ? (
            <Button variant="outline" onClick={() => handleStatusChange('active')}>
              <PlayCircle className="mr-2 h-4 w-4" />
              Resume Workflow
            </Button>
          ) : null}
          
          <Button variant="destructive" onClick={handleCancel}>
            <XCircle className="mr-2 h-4 w-4" />
            Cancel Workflow
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          <Badge className={`
            ${workflow.status === 'active' ? 'bg-green-100 text-green-800 border-green-200' : ''}
            ${workflow.status === 'inactive' ? 'bg-amber-100 text-amber-800 border-amber-200' : ''}
            ${workflow.status === 'draft' ? 'bg-gray-100 text-gray-800 border-gray-200' : ''}
          `}>
            {workflow.status.charAt(0).toUpperCase() + workflow.status.slice(1)}
          </Badge>
          <Badge variant="outline">{workflow.type}</Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                <div className="flex items-center">
                  <Calendar className="mr-2 h-4 w-4" />
                  Progress
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{progress}%</div>
              <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-primary rounded-full h-2" 
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {completedSteps} of {totalSteps} steps completed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                <div className="flex items-center">
                  <Clock className="mr-2 h-4 w-4" />
                  Estimated Time
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">7 days</div>
              <p className="text-xs text-muted-foreground mt-2">
                Expected completion on {new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                <div className="flex items-center">
                  <User className="mr-2 h-4 w-4" />
                  Assigned To
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">System</div>
              <p className="text-xs text-muted-foreground mt-2">
                This workflow is automated by the system
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="steps" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="steps">Workflow Steps</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>
          
          <TabsContent value="steps">
            <Card>
              <CardContent className="p-6">
                <div className="space-y-6">
                  {workflow.steps.map((step: WorkflowStep, index: number) => (
                    <div key={step.id} className="flex items-start gap-4 group">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-muted">
                        {step.isComplete ? (
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                        ) : (
                          <span className="text-sm font-medium">{index + 1}</span>
                        )}
                      </div>
                      <div className="flex-grow border-b pb-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-lg">
                            {step.name}
                          </h3>
                          {!step.isComplete && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="opacity-0 group-hover:opacity-100"
                              onClick={() => handleCompleteStep(step.id)}
                            >
                              Mark Complete
                            </Button>
                          )}
                        </div>
                        {step.description && (
                          <p className="text-muted-foreground text-sm">{step.description}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="history">
            <Card>
              <CardContent className="p-6">
                <p className="text-center text-muted-foreground py-8">
                  Workflow history feature coming soon.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="analytics">
            <Card>
              <CardContent className="p-6 flex justify-center items-center min-h-[300px]">
                <div className="text-center">
                  <BarChart3 className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-medium text-lg mb-2">Analytics Coming Soon</h3>
                  <p className="text-muted-foreground">
                    Workflow analytics will be available in a future update.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PageTemplate>
  );
};

export default WorkflowDetails;
