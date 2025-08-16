
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Workflow, 
  Sparkles, 
  Play, 
  Library, 
  Settings, 
  TrendingUp,
  Users,
  Clock,
  CheckCircle 
} from 'lucide-react';
import WorkflowTemplatesGallery from '@/components/workflow/WorkflowTemplatesGallery';
import AIWorkflowBuilder from '@/components/workflow/AIWorkflowBuilder';
import WorkflowExecutionsDashboard from '@/components/workflow/WorkflowExecutionsDashboard';
import { Workflow as WorkflowType } from '@/types/workflow-types';

interface AIWorkflowDashboardProps {
  associationId: string;
}

const AIWorkflowDashboard: React.FC<AIWorkflowDashboardProps> = ({ associationId }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedWorkflow, setSelectedWorkflow] = useState<WorkflowType | null>(null);

  const handleExecuteWorkflow = (workflow: WorkflowType) => {
    console.log('Executing workflow:', workflow.name);
    // Switch to executions tab to show the running workflow
    setActiveTab('executions');
  };

  const handleViewWorkflowDetails = (workflow: WorkflowType) => {
    setSelectedWorkflow(workflow);
    // Could open a modal or navigate to detail view
  };

  const handleWorkflowCreated = (workflowId: string) => {
    console.log('Workflow created:', workflowId);
    // Could switch to executions or show success message
    setActiveTab('templates');
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">AI Workflow Hub</h1>
          <p className="text-muted-foreground">
            Automate HOA operations with intelligent workflows and AI assistance
          </p>
        </div>
        <Button className="flex items-center gap-2">
          <Sparkles className="h-4 w-4" />
          Create Workflow
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <Library className="h-4 w-4" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="builder" className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            AI Builder
          </TabsTrigger>
          <TabsTrigger value="executions" className="flex items-center gap-2">
            <Play className="h-4 w-4" />
            Executions
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Available Templates</p>
                    <p className="text-2xl font-bold">20</p>
                  </div>
                  <Library className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Active Workflows</p>
                    <p className="text-2xl font-bold">3</p>
                  </div>
                  <Play className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Completed Today</p>
                    <p className="text-2xl font-bold">7</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-emerald-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Avg. Duration</p>
                    <p className="text-2xl font-bold">2.3h</p>
                  </div>
                  <Clock className="h-8 w-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Popular Workflow Templates</CardTitle>
                <CardDescription>
                  Most commonly used workflows in your organization
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { name: 'AP: Invoice Processing', type: 'Financial', usage: 24 },
                    { name: 'Work Order Intake & Triage', type: 'Maintenance', usage: 18 },
                    { name: 'Delinquency & Collections', type: 'Financial', usage: 12 },
                    { name: 'CC&R Violation Notice Sequence', type: 'Compliance', usage: 9 }
                  ].map((workflow, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="space-y-1">
                        <p className="font-medium text-sm">{workflow.name}</p>
                        <Badge variant="secondary" className="text-xs">
                          {workflow.type}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{workflow.usage}</p>
                        <p className="text-xs text-muted-foreground">executions</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>
                  Latest workflow executions and updates
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { 
                      action: 'Workflow Completed', 
                      workflow: 'Bank Reconciliation', 
                      time: '2 hours ago',
                      status: 'success'
                    },
                    { 
                      action: 'Workflow Started', 
                      workflow: 'Emergency Response Protocol', 
                      time: '3 hours ago',
                      status: 'running'
                    },
                    { 
                      action: 'Workflow Failed', 
                      workflow: 'Vendor Onboarding', 
                      time: '5 hours ago',
                      status: 'error'
                    },
                    { 
                      action: 'New Template Created', 
                      workflow: 'Custom Maintenance Flow', 
                      time: '1 day ago',
                      status: 'info'
                    }
                  ].map((activity, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 rounded-lg border">
                      <div className={`w-2 h-2 rounded-full ${
                        activity.status === 'success' ? 'bg-green-500' :
                        activity.status === 'running' ? 'bg-blue-500' :
                        activity.status === 'error' ? 'bg-red-500' : 'bg-gray-500'
                      }`} />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{activity.action}</p>
                        <p className="text-xs text-muted-foreground">{activity.workflow}</p>
                      </div>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates">
          <WorkflowTemplatesGallery
            associationId={associationId}
            onExecuteWorkflow={handleExecuteWorkflow}
            onViewDetails={handleViewWorkflowDetails}
          />
        </TabsContent>

        {/* AI Builder Tab */}
        <TabsContent value="builder">
          <AIWorkflowBuilder onWorkflowCreated={handleWorkflowCreated} />
        </TabsContent>

        {/* Executions Tab */}
        <TabsContent value="executions">
          <WorkflowExecutionsDashboard associationId={associationId} />
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Workflow Settings</CardTitle>
              <CardDescription>
                Configure workflow automation and notification preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">AI Settings</h3>
                  <p className="text-sm text-muted-foreground">
                    Configure AI-powered workflow generation and optimization
                  </p>
                  {/* Add AI settings form here */}
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Notification Settings</h3>
                  <p className="text-sm text-muted-foreground">
                    Choose how you want to be notified about workflow events
                  </p>
                  {/* Add notification settings here */}
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Integration Settings</h3>
                  <p className="text-sm text-muted-foreground">
                    Connect workflows with other systems and tools
                  </p>
                  {/* Add integration settings here */}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AIWorkflowDashboard;
