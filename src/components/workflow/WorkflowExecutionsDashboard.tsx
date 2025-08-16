
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Play, Pause, Square, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { workflowService, WorkflowExecution } from '@/services/workflow-service';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface WorkflowExecutionsDashboardProps {
  associationId: string;
}

const WorkflowExecutionsDashboard: React.FC<WorkflowExecutionsDashboardProps> = ({
  associationId
}) => {
  const [executions, setExecutions] = useState<WorkflowExecution[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadExecutions();
  }, [associationId]);

  const loadExecutions = async () => {
    try {
      setLoading(true);
      const data = await workflowService.getWorkflowExecutions(associationId);
      setExecutions(data);
    } catch (error) {
      console.error('Error loading workflow executions:', error);
      toast.error('Failed to load workflow executions');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: WorkflowExecution['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'running':
        return <Play className="h-4 w-4 text-blue-500" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'cancelled':
        return <Square className="h-4 w-4 text-gray-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: WorkflowExecution['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'running':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const calculateProgress = (execution: WorkflowExecution): number => {
    if (execution.status === 'completed') return 100;
    if (execution.status === 'failed' || execution.status === 'cancelled') return 0;
    if (execution.status === 'pending') return 0;
    
    // For running status, we could calculate based on completed steps
    // For now, return a default progress
    return 50;
  };

  const getExecutionDuration = (execution: WorkflowExecution): string => {
    if (!execution.started_at) return '-';
    
    const start = new Date(execution.started_at);
    const end = execution.completed_at ? new Date(execution.completed_at) : new Date();
    const durationMs = end.getTime() - start.getTime();
    const minutes = Math.floor(durationMs / 60000);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    }
    return `${minutes}m`;
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading workflow executions...</div>;
  }

  const runningExecutions = executions.filter(e => e.status === 'running');
  const completedExecutions = executions.filter(e => e.status === 'completed');
  const failedExecutions = executions.filter(e => e.status === 'failed');

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Executions</p>
                <p className="text-2xl font-bold">{executions.length}</p>
              </div>
              <Play className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Running</p>
                <p className="text-2xl font-bold text-blue-600">{runningExecutions.length}</p>
              </div>
              <Play className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold text-green-600">{completedExecutions.length}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Failed</p>
                <p className="text-2xl font-bold text-red-600">{failedExecutions.length}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Executions List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Workflow Executions</CardTitle>
          <CardDescription>
            Track the progress and status of workflow executions
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {executions.length === 0 ? (
            <div className="text-center py-8">
              <Play className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No executions yet</h3>
              <p className="text-gray-500">Execute a workflow to see it here</p>
            </div>
          ) : (
            <div className="space-y-4">
              {executions.map(execution => (
                <Card key={execution.id} className="border-l-4 border-l-blue-500">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(execution.status)}
                          <h4 className="font-medium">
                            {(execution as any).workflow?.name || 'Unknown Workflow'}
                          </h4>
                          <Badge className={getStatusColor(execution.status)} variant="secondary">
                            {execution.status}
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-muted-foreground">
                          {(execution as any).workflow?.description || 'No description available'}
                        </p>
                        
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>Started: {format(new Date(execution.created_at), 'MMM d, yyyy HH:mm')}</span>
                          <span>Duration: {getExecutionDuration(execution)}</span>
                          {execution.completed_at && (
                            <span>Completed: {format(new Date(execution.completed_at), 'MMM d, yyyy HH:mm')}</span>
                          )}
                        </div>
                        
                        {execution.status === 'running' && (
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <span>Progress</span>
                              <span>{calculateProgress(execution)}%</span>
                            </div>
                            <Progress value={calculateProgress(execution)} className="h-2" />
                          </div>
                        )}
                      </div>
                      
                      <div className="flex gap-2 ml-4">
                        <Button size="sm" variant="outline">
                          View Details
                        </Button>
                        {execution.status === 'running' && (
                          <Button size="sm" variant="outline">
                            <Pause className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default WorkflowExecutionsDashboard;
