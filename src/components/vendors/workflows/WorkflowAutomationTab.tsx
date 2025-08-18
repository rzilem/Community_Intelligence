
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { vendorWorkflowService } from "@/services/vendor-workflow-service";
import { useAuth } from "@/contexts/auth";
import { Plus, Play, Pause, Settings, Clock, CheckCircle, XCircle, TestTube } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";
import WorkflowAutomationDialog from "./WorkflowAutomationDialog";
import WorkflowTestingPanel from "./WorkflowTestingPanel";

const WorkflowAutomationTab: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { currentAssociation } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [showTesting, setShowTesting] = useState(false);

  const { data: workflows, isLoading } = useQuery({
    queryKey: ['workflow-automations', currentAssociation?.id],
    queryFn: () => vendorWorkflowService.getWorkflowAutomations(currentAssociation!.id),
    enabled: !!currentAssociation?.id,
  });

  const toggleWorkflowMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      vendorWorkflowService.updateWorkflowAutomation(id, { is_active: isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflow-automations'] });
      toast({ title: "Workflow updated successfully" });
    },
    onError: (error) => {
      toast({ 
        title: "Error updating workflow", 
        description: error.message,
        variant: "destructive" 
      });
    }
  });

  const getTriggerTypeLabel = (type: string) => {
    const labels = {
      'contract_expiry': 'Contract Expiry',
      'performance_threshold': 'Performance Threshold',
      'compliance_due': 'Compliance Due',
      'payment_overdue': 'Payment Overdue',
      'custom': 'Custom'
    };
    return labels[type as keyof typeof labels] || type;
  };

  const getTriggerTypeColor = (type: string) => {
    const colors = {
      'contract_expiry': 'bg-yellow-100 text-yellow-800',
      'performance_threshold': 'bg-blue-100 text-blue-800',
      'compliance_due': 'bg-orange-100 text-orange-800',
      'payment_overdue': 'bg-red-100 text-red-800',
      'custom': 'bg-gray-100 text-gray-800'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-6 bg-gray-200 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Workflow Automations</h3>
          <p className="text-muted-foreground">
            Automate vendor management tasks and notifications
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant={showTesting ? "secondary" : "outline"}
            onClick={() => setShowTesting(!showTesting)}
          >
            <TestTube className="mr-2 h-4 w-4" />
            {showTesting ? 'Hide Testing' : 'Show Testing'}
          </Button>
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Workflow
          </Button>
        </div>
      </div>

      {/* Workflows List */}
      <div className="space-y-4">
        {workflows?.map((workflow) => (
          <Card key={workflow.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <CardTitle className="text-lg">{workflow.name}</CardTitle>
                  <Badge className={getTriggerTypeColor(workflow.trigger_type)}>
                    {getTriggerTypeLabel(workflow.trigger_type)}
                  </Badge>
                  <Switch 
                    checked={workflow.is_active}
                    onCheckedChange={(checked) => {
                      toggleWorkflowMutation.mutate({ id: workflow.id, isActive: checked });
                    }}
                    disabled={toggleWorkflowMutation.isPending}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Play className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {workflow.description && (
                  <p className="text-muted-foreground">{workflow.description}</p>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Trigger Conditions</h4>
                    <div className="text-sm text-muted-foreground">
                      {Object.keys(workflow.trigger_conditions).length > 0 ? (
                        <ul className="space-y-1">
                          {Object.entries(workflow.trigger_conditions).map(([key, value]) => (
                            <li key={key}>
                              {key}: {String(value)}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        'No specific conditions'
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Actions</h4>
                    <div className="text-sm text-muted-foreground">
                      {workflow.actions.length > 0 ? (
                        <ul className="space-y-1">
                          {workflow.actions.map((action, index) => (
                            <li key={index}>
                              {action.type.replace('_', ' ')}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        'No actions configured'
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Status</h4>
                    <div className="flex items-center space-x-2">
                      {workflow.is_active ? (
                        <>
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-sm text-green-600">Active</span>
                        </>
                      ) : (
                        <>
                          <Pause className="h-4 w-4 text-gray-500" />
                          <span className="text-sm text-gray-600">Inactive</span>
                        </>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Created {new Date(workflow.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {(!workflows || workflows.length === 0) && (
          <Card>
            <CardContent className="p-8 text-center">
              <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No Workflows Created</h3>
              <p className="text-muted-foreground mb-4">
                Create your first workflow automation to streamline vendor management tasks.
              </p>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create First Workflow
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Testing Panel */}
      {showTesting && (
        <div className="mt-8">
          <WorkflowTestingPanel />
        </div>
      )}

      <WorkflowAutomationDialog 
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      />
    </div>
  );
};

export default WorkflowAutomationTab;
