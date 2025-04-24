
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageTemplate from '@/components/layout/PageTemplate';
import { useWorkflows } from '@/hooks/operations/useWorkflows';
import WorkflowTabs from '@/components/operations/WorkflowTabs';
import { Button } from '@/components/ui/button';
import { Plus, AlertCircle } from 'lucide-react';
import WorkflowTemplateCard from '@/components/operations/WorkflowTemplateCard';
import ActiveWorkflowCard from '@/components/operations/ActiveWorkflowCard';
import ResponsiveGrid from '@/components/layout/ResponsiveGrid';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { WorkflowType } from '@/types/workflow-types';

const Workflows = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('templates');
  const [isNewWorkflowDialogOpen, setIsNewWorkflowDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const {
    workflows,
    templates,
    isLoading,
    error,
    saveWorkflow,
    removeWorkflow,
    createFromTemplate,
    duplicateWorkflow,
    updateWorkflowStatus,
    searchTerm: hookSearchTerm,
    setSearchTerm: setHookSearchTerm
  } = useWorkflows();

  // Initialize form state for new workflow dialog
  const [newWorkflow, setNewWorkflow] = useState({
    name: '',
    description: '',
    type: 'Financial' as WorkflowType
  });

  useEffect(() => {
    setHookSearchTerm(searchTerm);
  }, [searchTerm, setHookSearchTerm]);

  const handleCreateWorkflow = async () => {
    const success = await saveWorkflow({
      ...newWorkflow,
      steps: [],
      status: 'draft',
      is_template: activeTab === 'templates'
    });

    if (success) {
      setIsNewWorkflowDialogOpen(false);
      setNewWorkflow({
        name: '',
        description: '',
        type: 'Financial' as WorkflowType
      });
    }
  };

  // Filter workflows and templates based on search term
  const filteredTemplates = templates.filter(template => 
    template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (template.description && template.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
    template.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredWorkflows = workflows.filter(workflow => 
    workflow.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (workflow.description && workflow.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
    workflow.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handlers for workflow actions
  const handleUseTemplate = async (id: string) => {
    const newWorkflowId = await createFromTemplate(id);
    if (newWorkflowId) {
      setActiveTab('active');
    }
  };

  const handleDuplicateTemplate = async (id: string) => {
    await duplicateWorkflow(id);
  };

  const handleViewDetails = (id: string) => {
    navigate(`/operations/workflows/${id}`);
  };

  const handlePauseWorkflow = async (id: string) => {
    await updateWorkflowStatus(id, 'inactive');
  };

  const handleResumeWorkflow = async (id: string) => {
    await updateWorkflowStatus(id, 'active');
  };

  const handleCancelWorkflow = async (id: string) => {
    await updateWorkflowStatus(id, 'archived');
  };

  const handleEditWorkflow = (id: string) => {
    navigate(`/operations/workflows/edit/${id}`);
  };

  const handleDeleteWorkflow = async (id: string) => {
    await removeWorkflow(id);
  };

  return (
    <PageTemplate title="Workflows" loading={isLoading}>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <h1 className="text-3xl font-bold">Workflow Management</h1>
          <Button onClick={() => setIsNewWorkflowDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            {activeTab === 'templates' ? 'New Template' : 'New Workflow'}
          </Button>
        </div>

        <WorkflowTabs
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
        />

        {error ? (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
            <h2 className="text-2xl font-semibold mb-2">Error Loading Workflows</h2>
            <p className="text-muted-foreground mb-6">{error.message}</p>
            <Button onClick={() => window.location.reload()}>Refresh</Button>
          </div>
        ) : (
          <>
            {activeTab === 'templates' && (
              <>
                {filteredTemplates.length === 0 ? (
                  <div className="text-center p-12 border rounded-lg">
                    <h3 className="font-semibold text-lg mb-2">No templates found</h3>
                    <p className="text-muted-foreground mb-6">
                      {searchTerm ? 
                        `No templates match "${searchTerm}"` : 
                        "You haven't created any workflow templates yet"
                      }
                    </p>
                    <Button onClick={() => setIsNewWorkflowDialogOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Template
                    </Button>
                  </div>
                ) : (
                  <ResponsiveGrid 
                    mobileColumns={1}
                    desktopColumns={3}
                    gap="md"
                  >
                    {filteredTemplates.map(template => (
                      <WorkflowTemplateCard
                        key={template.id}
                        workflow={template}
                        onUseTemplate={handleUseTemplate}
                        onDuplicateTemplate={handleDuplicateTemplate}
                        onEditTemplate={handleEditWorkflow}
                        onDeleteTemplate={handleDeleteWorkflow}
                      />
                    ))}
                  </ResponsiveGrid>
                )}
              </>
            )}

            {activeTab === 'active' && (
              <>
                {filteredWorkflows.length === 0 ? (
                  <div className="text-center p-12 border rounded-lg">
                    <h3 className="font-semibold text-lg mb-2">No active workflows</h3>
                    <p className="text-muted-foreground mb-6">
                      {searchTerm ? 
                        `No workflows match "${searchTerm}"` : 
                        "You haven't created any workflows yet"
                      }
                    </p>
                    <div className="flex gap-4 justify-center">
                      <Button onClick={() => setActiveTab('templates')}>
                        Use Template
                      </Button>
                      <Button onClick={() => setIsNewWorkflowDialogOpen(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Workflow
                      </Button>
                    </div>
                  </div>
                ) : (
                  <ResponsiveGrid 
                    mobileColumns={1}
                    desktopColumns={3}
                    gap="md"
                  >
                    {filteredWorkflows.map(workflow => (
                      <ActiveWorkflowCard
                        key={workflow.id}
                        workflow={workflow}
                        onViewDetails={handleViewDetails}
                        onPauseWorkflow={handlePauseWorkflow}
                        onResumeWorkflow={handleResumeWorkflow}
                        onCancelWorkflow={handleCancelWorkflow}
                        onEditWorkflow={handleEditWorkflow}
                        onDeleteWorkflow={handleDeleteWorkflow}
                      />
                    ))}
                  </ResponsiveGrid>
                )}
              </>
            )}

            {activeTab === 'custom' && (
              <div className="text-center p-12 border rounded-lg">
                <h3 className="font-semibold text-lg mb-2">Custom Workflows</h3>
                <p className="text-muted-foreground mb-6">
                  This feature is coming soon. You'll be able to create custom workflow templates.
                </p>
              </div>
            )}

            {activeTab === 'builder' && (
              <div className="text-center p-12 border rounded-lg">
                <h3 className="font-semibold text-lg mb-2">Workflow Builder</h3>
                <p className="text-muted-foreground mb-6">
                  Advanced workflow builder is coming soon. You'll be able to create complex workflows with branching logic.
                </p>
              </div>
            )}

            {activeTab === 'analytics' && (
              <div className="text-center p-12 border rounded-lg">
                <h3 className="font-semibold text-lg mb-2">Workflow Analytics</h3>
                <p className="text-muted-foreground mb-6">
                  Workflow analytics are coming soon. You'll be able to track workflow performance and completion rates.
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {/* New Workflow Dialog */}
      <Dialog open={isNewWorkflowDialogOpen} onOpenChange={setIsNewWorkflowDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {activeTab === 'templates' ? 'Create Workflow Template' : 'Create New Workflow'}
            </DialogTitle>
            <DialogDescription>
              {activeTab === 'templates' ? 
                'Create a reusable workflow template that can be used as a starting point for future workflows.' :
                'Create a new workflow to track and manage your operations.'
              }
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="Enter workflow name"
                value={newWorkflow.name}
                onChange={(e) => setNewWorkflow({...newWorkflow, name: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select
                value={newWorkflow.type}
                onValueChange={(value) => setNewWorkflow({...newWorkflow, type: value as WorkflowType})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
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
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe the purpose of this workflow"
                value={newWorkflow.description || ''}
                onChange={(e) => setNewWorkflow({...newWorkflow, description: e.target.value})}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNewWorkflowDialogOpen(false)}>Cancel</Button>
            <Button 
              disabled={!newWorkflow.name} 
              onClick={handleCreateWorkflow}
            >
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageTemplate>
  );
};

export default Workflows;
