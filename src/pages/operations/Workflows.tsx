
import React from 'react';
import { useWorkflows } from '@/hooks/operations/useWorkflows';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus } from 'lucide-react';
import PageTemplate from '@/components/layout/PageTemplate';
import { useNavigate } from 'react-router-dom';
import { WorkflowFilters } from '@/components/operations/workflow/filters/WorkflowFilters';
import WorkflowTabContent from '@/components/operations/workflow/tabs/WorkflowTabContent';
import { NewWorkflowDialog } from '@/components/operations/workflow/dialogs/NewWorkflowDialog';
import { useWorkflowDialog } from '@/hooks/operations/useWorkflowDialog';

const Workflows = () => {
  const navigate = useNavigate();
  const {
    workflows,
    templates,
    isLoading,
    searchTerm,
    setSearchTerm,
    createFromTemplate,
    duplicateWorkflow,
  } = useWorkflows();

  const {
    newDialogOpen,
    setNewDialogOpen,
    workflowName,
    setWorkflowName,
    workflowDescription,
    setWorkflowDescription,
    workflowType,
    setWorkflowType,
    templateId,
    setTemplateId,
    handleCreate,
    isCreating
  } = useWorkflowDialog();

  const handleUseTemplate = async (id: string) => {
    await createFromTemplate(id);
  };

  const handleDuplicateWorkflow = async (id: string) => {
    await duplicateWorkflow(id);
  };

  const handleViewWorkflow = (id: string) => {
    navigate(`/operations/workflows/${id}`);
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
          <WorkflowFilters 
            searchTerm={searchTerm} 
            onSearchChange={setSearchTerm} 
          />
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
            <WorkflowTabContent
              workflows={filteredWorkflows.filter(w => w.status === 'active')}
              isLoading={isLoading}
              onViewDetails={handleViewWorkflow}
              onDuplicate={handleDuplicateWorkflow}
            />
          </TabsContent>

          <TabsContent value="templates" className="mt-4">
            <WorkflowTabContent
              workflows={filteredTemplates}
              isLoading={isLoading}
              onViewDetails={handleViewWorkflow}
              onDuplicate={handleDuplicateWorkflow}
              onUseTemplate={handleUseTemplate}
              isTemplate
            />
          </TabsContent>

          <TabsContent value="drafts" className="mt-4">
            <WorkflowTabContent
              workflows={filteredWorkflows.filter(w => w.status === 'draft')}
              isLoading={isLoading}
              onViewDetails={handleViewWorkflow}
              onDuplicate={handleDuplicateWorkflow}
            />
          </TabsContent>

          <TabsContent value="completed" className="mt-4">
            <WorkflowTabContent
              workflows={filteredWorkflows.filter(w => w.status === 'completed')}
              isLoading={isLoading}
              onViewDetails={handleViewWorkflow}
              onDuplicate={handleDuplicateWorkflow}
            />
          </TabsContent>

          <TabsContent value="all" className="mt-4">
            <WorkflowTabContent
              workflows={filteredWorkflows}
              isLoading={isLoading}
              onViewDetails={handleViewWorkflow}
              onDuplicate={handleDuplicateWorkflow}
            />
          </TabsContent>
        </Tabs>
      </div>

      <NewWorkflowDialog
        open={newDialogOpen}
        onOpenChange={setNewDialogOpen}
        workflowName={workflowName}
        workflowDescription={workflowDescription}
        workflowType={workflowType}
        templateId={templateId}
        templates={templates}
        isCreating={isCreating}
        onWorkflowNameChange={setWorkflowName}
        onWorkflowDescriptionChange={setWorkflowDescription}
        onWorkflowTypeChange={setWorkflowType}
        onTemplateIdChange={setTemplateId}
        onCreate={handleCreate}
      />
    </PageTemplate>
  );
};

export default Workflows;
