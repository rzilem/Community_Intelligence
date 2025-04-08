
import React, { useState } from 'react';
import PageTemplate from '@/components/layout/PageTemplate';
import { MailCheck, Clock, ToggleLeft, ToggleRight, ArrowRight, Settings, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';

interface EmailWorkflowProps {
  id: string;
  name: string;
  description: string;
  type: 'system' | 'automated' | 'triggered';
  enabled: boolean;
  lastEdited?: string;
  triggers?: string[];
}

const emailWorkflows: EmailWorkflowProps[] = [
  {
    id: '1',
    name: 'Welcome Email',
    description: 'Sent to new residents when they are added to the system',
    type: 'system',
    enabled: true,
    lastEdited: '2025-03-15',
    triggers: ['New resident added']
  },
  {
    id: '2',
    name: 'Payment Confirmation',
    description: 'Sent when a resident makes a payment',
    type: 'system',
    enabled: true,
    lastEdited: '2025-03-10',
    triggers: ['Payment received']
  },
  {
    id: '3',
    name: 'Monthly Statement',
    description: 'Automated monthly account statement',
    type: 'automated',
    enabled: true,
    lastEdited: '2025-03-05',
    triggers: ['1st day of month']
  },
  {
    id: '4',
    name: 'Late Payment Reminder',
    description: 'Reminder sent 5 days after payment due date',
    type: 'automated',
    enabled: true,
    lastEdited: '2025-02-28',
    triggers: ['5 days after due date']
  },
  {
    id: '5',
    name: 'Violation Notice',
    description: 'Sent when a compliance violation is recorded',
    type: 'triggered',
    enabled: false,
    lastEdited: '2025-02-20',
    triggers: ['Violation recorded']
  },
  {
    id: '6',
    name: 'Maintenance Request Update',
    description: 'Sent when maintenance request status changes',
    type: 'triggered',
    enabled: true,
    lastEdited: '2025-03-12',
    triggers: ['Maintenance status change']
  }
];

const EmailWorkflowCard = ({ workflow, onToggle }: { workflow: EmailWorkflowProps, onToggle: (id: string, enabled: boolean) => void }) => (
  <Card className="mb-4">
    <CardContent className="p-6">
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-medium">{workflow.name}</h3>
            {workflow.type === 'system' && (
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                System
              </Badge>
            )}
            {workflow.type === 'automated' && (
              <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                <Clock className="h-3 w-3 mr-1" />
                Scheduled
              </Badge>
            )}
            {workflow.type === 'triggered' && (
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                Triggered
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">{workflow.description}</p>
          
          {workflow.triggers && workflow.triggers.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              <span className="text-xs text-muted-foreground">Triggers:</span>
              {workflow.triggers.map((trigger, i) => (
                <Badge key={i} variant="secondary" className="text-xs">
                  {trigger}
                </Badge>
              ))}
            </div>
          )}
        </div>
        
        <div className="flex items-center">
          <Switch 
            checked={workflow.enabled}
            onCheckedChange={(checked) => onToggle(workflow.id, checked)}
            className="mr-2"
          />
          <span className="text-sm text-muted-foreground">
            {workflow.enabled ? 'Enabled' : 'Disabled'}
          </span>
        </div>
      </div>
      
      <div className="flex justify-between items-center mt-4 pt-4 border-t">
        <span className="text-xs text-muted-foreground">
          Last edited: {workflow.lastEdited || 'Never'}
        </span>
        
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            Preview
          </Button>
          <Button size="sm">
            Edit Template
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </CardContent>
  </Card>
);

const EmailWorkflows: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  const toggleWorkflow = (id: string, enabled: boolean) => {
    console.log(`Toggling workflow ${id} to ${enabled}`);
    // In a real app, this would update the state
  };

  const filteredWorkflows = emailWorkflows.filter(workflow => {
    const matchesSearch = workflow.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          workflow.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (activeTab === 'all') return matchesSearch;
    if (activeTab === 'system') return matchesSearch && workflow.type === 'system';
    if (activeTab === 'automated') return matchesSearch && workflow.type === 'automated';
    if (activeTab === 'triggered') return matchesSearch && workflow.type === 'triggered';
    
    return false;
  });

  return (
    <PageTemplate 
      title="Email Workflows" 
      icon={<MailCheck className="h-8 w-8" />}
      description="Setup and manage automated email workflows and notifications."
    >
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="relative w-full sm:w-auto">
            <Input
              placeholder="Search workflows..."
              className="w-full sm:w-[300px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex gap-3 w-full sm:w-auto">
            <Button variant="outline" className="flex-1 sm:flex-none gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </Button>
            <Button className="flex-1 sm:flex-none gap-2">
              <Plus className="h-4 w-4" />
              Create Workflow
            </Button>
          </div>
        </div>
        
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="all">All Workflows</TabsTrigger>
            <TabsTrigger value="system">System</TabsTrigger>
            <TabsTrigger value="automated">Automated</TabsTrigger>
            <TabsTrigger value="triggered">Triggered</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="space-y-4">
            {filteredWorkflows.length > 0 ? (
              filteredWorkflows.map(workflow => (
                <EmailWorkflowCard
                  key={workflow.id}
                  workflow={workflow}
                  onToggle={toggleWorkflow}
                />
              ))
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-muted-foreground">No workflows found matching your search.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="system" className="space-y-4">
            {filteredWorkflows.length > 0 ? (
              filteredWorkflows.map(workflow => (
                <EmailWorkflowCard
                  key={workflow.id}
                  workflow={workflow}
                  onToggle={toggleWorkflow}
                />
              ))
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-muted-foreground">No system workflows found matching your search.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="automated" className="space-y-4">
            {filteredWorkflows.length > 0 ? (
              filteredWorkflows.map(workflow => (
                <EmailWorkflowCard
                  key={workflow.id}
                  workflow={workflow}
                  onToggle={toggleWorkflow}
                />
              ))
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-muted-foreground">No automated workflows found matching your search.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="triggered" className="space-y-4">
            {filteredWorkflows.length > 0 ? (
              filteredWorkflows.map(workflow => (
                <EmailWorkflowCard
                  key={workflow.id}
                  workflow={workflow}
                  onToggle={toggleWorkflow}
                />
              ))
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-muted-foreground">No triggered workflows found matching your search.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </PageTemplate>
  );
};

export default EmailWorkflows;
