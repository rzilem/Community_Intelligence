import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { useMutation, useQuery } from '@tanstack/react-query';
import { vendorWorkflowService } from '@/services/vendor-workflow-service';
import { useAuth } from '@/contexts/auth';
import { Play, RefreshCw, Clock, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

const WorkflowTestingPanel: React.FC = () => {
  const { toast } = useToast();
  const { currentAssociation } = useAuth();
  const [selectedWorkflow, setSelectedWorkflow] = useState<string>('');
  const [testData, setTestData] = useState<Record<string, any>>({});

  const { data: workflows } = useQuery({
    queryKey: ['workflow-automations', currentAssociation?.id],
    queryFn: () => vendorWorkflowService.getWorkflowAutomations(currentAssociation!.id),
    enabled: !!currentAssociation?.id,
  });

  const { data: executions, refetch: refetchExecutions } = useQuery({
    queryKey: ['workflow-executions', currentAssociation?.id],
    queryFn: () => vendorWorkflowService.getWorkflowExecutions(currentAssociation!.id),
    enabled: !!currentAssociation?.id,
  });

  const { data: actionLogs } = useQuery({
    queryKey: ['workflow-action-logs', currentAssociation?.id],
    queryFn: () => vendorWorkflowService.getWorkflowActionLogs(currentAssociation!.id),
    enabled: !!currentAssociation?.id,
  });

  const triggerWorkflowMutation = useMutation({
    mutationFn: ({ eventType, eventData }: { eventType: string; eventData: any }) =>
      vendorWorkflowService.triggerWorkflowEvent(eventType, eventData),
    onSuccess: () => {
      toast({ title: "Workflow triggered successfully" });
      refetchExecutions();
    },
    onError: (error) => {
      toast({ 
        title: "Error triggering workflow", 
        description: error.message,
        variant: "destructive" 
      });
    }
  });

  const executeWorkflowMutation = useMutation({
    mutationFn: ({ workflowId, testData }: { workflowId: string; testData: any }) =>
      vendorWorkflowService.executeWorkflow(workflowId, testData),
    onSuccess: () => {
      toast({ title: "Workflow execution started" });
      refetchExecutions();
    },
    onError: (error) => {
      toast({ 
        title: "Error executing workflow", 
        description: error.message,
        variant: "destructive" 
      });
    }
  });

  const handleTriggerWorkflow = () => {
    if (!selectedWorkflow || !currentAssociation?.id) return;

    const selectedWorkflowData = workflows?.find(w => w.id === selectedWorkflow);
    if (!selectedWorkflowData) return;

    const eventData = {
      trigger_type: selectedWorkflowData.trigger_type,
      test_mode: true,
      ...testData
    };

    triggerWorkflowMutation.mutate({
      eventType: selectedWorkflowData.trigger_type,
      eventData
    });
  };

  const handleExecuteWorkflow = () => {
    if (!selectedWorkflow) return;

    executeWorkflowMutation.mutate({
      workflowId: selectedWorkflow,
      testData: { test_mode: true, ...testData }
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'running':
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'running':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Testing Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Workflow Testing</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="workflow-select">Select Workflow</Label>
              <Select value={selectedWorkflow} onValueChange={setSelectedWorkflow}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a workflow to test" />
                </SelectTrigger>
                <SelectContent>
                  {workflows?.map((workflow) => (
                    <SelectItem key={workflow.id} value={workflow.id}>
                      {workflow.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="vendor-id">Test Vendor ID</Label>
              <Input
                id="vendor-id"
                placeholder="Enter vendor ID for testing"
                value={testData.vendor_id || ''}
                onChange={(e) => setTestData(prev => ({ ...prev, vendor_id: e.target.value }))}
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleTriggerWorkflow}
              disabled={!selectedWorkflow || triggerWorkflowMutation.isPending}
            >
              <Play className="mr-2 h-4 w-4" />
              {triggerWorkflowMutation.isPending ? 'Triggering...' : 'Trigger Event'}
            </Button>
            <Button
              variant="outline"
              onClick={handleExecuteWorkflow}
              disabled={!selectedWorkflow || executeWorkflowMutation.isPending}
            >
              <Play className="mr-2 h-4 w-4" />
              {executeWorkflowMutation.isPending ? 'Executing...' : 'Direct Execute'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Executions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Executions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {executions?.slice(0, 10).map((execution) => (
              <div key={execution.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(execution.execution_status)}
                  <div>
                    <div className="font-medium">
                      {workflows?.find(w => w.id === execution.automation_id)?.name || 'Unknown Workflow'}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Started {new Date(execution.started_at).toLocaleString()}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className={getStatusColor(execution.execution_status)}>
                    {execution.execution_status}
                  </Badge>
                  {execution.completed_at && (
                    <span className="text-xs text-muted-foreground">
                      {Math.round((new Date(execution.completed_at).getTime() - new Date(execution.started_at).getTime()) / 1000)}s
                    </span>
                  )}
                </div>
              </div>
            ))}

            {(!executions || executions.length === 0) && (
              <div className="text-center py-6 text-muted-foreground">
                No workflow executions found. Trigger a workflow to see results here.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Action Logs */}
      <Card>
        <CardHeader>
          <CardTitle>Action Logs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {actionLogs?.slice(0, 20).map((log) => (
              <div key={log.id} className="flex items-center justify-between p-2 text-sm border-l-2 border-gray-200 pl-3">
                <div className="flex items-center space-x-2">
                  {getStatusIcon(log.status)}
                  <span className="font-medium">{log.action_type}</span>
                  <span className="text-muted-foreground">{log.details?.message || 'No details'}</span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {new Date(log.executed_at).toLocaleString()}
                </span>
              </div>
            ))}

            {(!actionLogs || actionLogs.length === 0) && (
              <div className="text-center py-6 text-muted-foreground">
                No action logs found. Execute workflows to see action details here.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WorkflowTestingPanel;