import React, { useState, useEffect } from 'react';
import { useWorkflows } from '@/hooks/operations/useWorkflows';
import { Workflow } from '@/types/workflow-types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, Loader2 } from 'lucide-react';
import PageTemplate from '@/components/layout/PageTemplate';
import WorkflowTemplateCard from '@/components/operations/WorkflowTemplateCard';

const Workflows = () => {
  const [newDialogOpen, setNewDialogOpen] = useState(false);
  const [workflowName, setWorkflowName] = useState('');
  const [workflowDescription, setWorkflowDescription] = useState('');
  const [workflowType, setWorkflowType] = useState<string>('Governance');
  const {
    workflows,
    templates,
    isLoading,
    saveWorkflow,
    searchTerm,
    setSearchTerm,
    createFromTemplate,
    isLoading: isCreating
  } = useWorkflows();

  const [templateId, setTemplateId] = useState<string | null>(null);

  const handleCreate = async () => {
    if (!workflowName) return;

    let newWorkflowId: string | null = null;

    if (templateId) {
      newWorkflowId = await createFromTemplate(templateId);
    } else {
      const success = await saveWorkflow({
        name: workflowName,
        description: workflowDescription,
        type: workflowType,
        steps: [],
        is_template: false
      });
      if (success) {
        setWorkflowName('');
        setWorkflowDescription('');
        setWorkflowType('Governance');
      }
    }

    if (newWorkflowId) {
      setNewDialogOpen(false);
    }
  };

  const filteredWorkflows = workflows.filter(workflow =>
    workflow.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredTemplates = templates.filter(template =>
    template.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <PageTemplate title="Workflows" icon={<i className="icon" />}>
      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <div className="relative max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search workflows..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setNewDialogOpen(true)}>
              <Plus className="mr-1 h-4 w-4" />
              New Workflow
            </Button>
          </div>
        </div>

        <Tabs defaultValue="active">
          <TabsList>
            <TabsTrigger value="active">Active Workflows</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="drafts">Drafts</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="all">All</TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="mt-4">
            {isLoading ? (
              <p>Loading workflows...</p>
            ) : (
              <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredWorkflows.filter(w => w.status === 'active').map(workflow => (
                  <Card key={workflow.id}>
                    <WorkflowTemplateCard workflow={workflow} />
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="templates" className="mt-4">
            {isLoading ? (
              <p>Loading templates...</p>
            ) : (
              <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredTemplates.map(template => (
                  <Card key={template.id}>
                    <WorkflowTemplateCard workflow={template} />
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="drafts" className="mt-4">
            {isLoading ? (
              <p>Loading drafts...</p>
            ) : (
              <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredWorkflows.filter(w => w.status === 'draft').map(workflow => (
                  <Card key={workflow.id}>
                    <WorkflowTemplateCard workflow={workflow} />
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="completed" className="mt-4">
            {isLoading ? (
              <p>Loading completed workflows...</p>
            ) : (
              <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredWorkflows.filter(w => w.status === 'completed').map(workflow => (
                  <Card key={workflow.id}>
                    <WorkflowTemplateCard workflow={workflow} />
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="all" className="mt-4">
            {isLoading ? (
              <p>Loading all workflows...</p>
            ) : (
              <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredWorkflows.map(workflow => (
                  <Card key={workflow.id}>
                    <WorkflowTemplateCard workflow={workflow} />
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* New Workflow Dialog */}
      <Dialog open={newDialogOpen} onOpenChange={setNewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Workflow</DialogTitle>
            <DialogDescription>
              Start from scratch or use a template to create your workflow.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Workflow Name</Label>
              <Input
                id="name"
                placeholder="Workflow name"
                value={workflowName}
                onChange={(e) => setWorkflowName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Workflow description"
                value={workflowDescription}
                onChange={(e) => setWorkflowDescription(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select onValueChange={setWorkflowType}>
                <SelectTrigger id="type">
                  <SelectValue placeholder="Select workflow type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Financial">Financial</SelectItem>
                  <SelectItem value="Compliance">Compliance</SelectItem>
                  <SelectItem value="Maintenance">Maintenance</SelectItem>
                  <SelectItem value="Resident Management">Resident Management</SelectItem>
                  <SelectItem value="Governance">Governance</SelectItem>
                  <SelectItem value="Communication">Communication</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="template">Use Template (optional)</Label>
              <Select onValueChange={setTemplateId}>
                <SelectTrigger id="template">
                  <SelectValue placeholder="Select a template" />
                </SelectTrigger>
                <SelectContent>
                  {templates.map(template => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                    </SelectItem>
                  ))}
                  <SelectItem value="">None</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={!workflowName || isCreating}>
              {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageTemplate>
  );
};

export default Workflows;
