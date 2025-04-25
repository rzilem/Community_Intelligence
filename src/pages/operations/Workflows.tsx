
import React, { useState, useMemo } from 'react';
import PageTemplate from '@/components/layout/PageTemplate';
import { Workflow as WorkflowIcon, Plus, Loader2, Filter } from 'lucide-react';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import WorkflowTabs from '@/components/operations/WorkflowTabs';
import WorkflowTemplateCard from '@/components/operations/WorkflowTemplateCard';
import { useWorkflows } from '@/hooks/operations/useWorkflows';
import ActiveWorkflowCard from '@/components/operations/ActiveWorkflowCard';
import { WorkflowType } from '@/types/workflow-types';
import WorkflowAnalyticsDashboard from '@/components/operations/WorkflowAnalyticsDashboard';
import WorkflowCreateDialog from '@/components/operations/dialogs/WorkflowCreateDialog';
import WorkflowDeleteDialog from '@/components/operations/dialogs/WorkflowDeleteDialog';

const Workflows = () => {
  const [activeTab, setActiveTab] = useState<string>('templates');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<WorkflowType | 'all'>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [deleteDialogState, setDeleteDialogState] = useState<{
    isOpen: boolean;
    workflowId: string | null;
    workflowName: string;
    isTemplate: boolean;
  }>({
    isOpen: false,
    workflowId: null,
    workflowName: '',
    isTemplate: true
  });
  
  const { 
    workflowTemplates, 
    activeWorkflows,
    loading, 
    useWorkflowTemplate, 
    createCustomTemplate,
    duplicateTemplate,
    pauseWorkflow,
    resumeWorkflow,
    cancelWorkflow,
    viewWorkflowDetails,
    deleteTemplate,
    isDeleting,
    isCreating
  } = useWorkflows();

  const filteredTemplates = useMemo(() => {
    return workflowTemplates.filter(workflow => {
      const matchesSearch = workflow.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        workflow.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = typeFilter === 'all' || workflow.type === typeFilter;
      return matchesSearch && matchesType;
    });
  }, [workflowTemplates, searchTerm, typeFilter]);

  const filteredActiveWorkflows = useMemo(() => {
    return activeWorkflows.filter(workflow => {
      const matchesSearch = workflow.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        workflow.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = typeFilter === 'all' || workflow.type === typeFilter;
      return matchesSearch && matchesType;
    });
  }, [activeWorkflows, searchTerm, typeFilter]);

  const workflowTypes: WorkflowType[] = [
    'Financial', 
    'Compliance', 
    'Maintenance', 
    'Resident Management', 
    'Governance', 
    'Communication'
  ];

  const handleCreateWorkflow = async (values: {
    name: string;
    description?: string;
    type: WorkflowType;
  }) => {
    await createCustomTemplate(values);
  };

  const openDeleteDialog = (id: string, name: string, isTemplate: boolean) => {
    setDeleteDialogState({
      isOpen: true,
      workflowId: id,
      workflowName: name,
      isTemplate
    });
  };

  const handleDelete = async () => {
    if (!deleteDialogState.workflowId) return;
    
    try {
      if (deleteDialogState.isTemplate) {
        await deleteTemplate(deleteDialogState.workflowId);
      } else {
        await cancelWorkflow(deleteDialogState.workflowId);
      }
      setDeleteDialogState(prev => ({ ...prev, isOpen: false }));
    } catch (error) {
      console.error('Error deleting workflow:', error);
    }
  };

  return (
    <PageTemplate 
      title="Workflow Management" 
      icon={<WorkflowIcon className="h-8 w-8" />}
      description="Create and manage automated workflows for your association processes"
      actions={
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Filter className="mr-2 h-4 w-4" />
                {typeFilter === 'all' ? 'All Types' : typeFilter}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuCheckboxItem
                checked={typeFilter === 'all'}
                onCheckedChange={() => setTypeFilter('all')}
              >
                All Types
              </DropdownMenuCheckboxItem>
              {workflowTypes.map((type) => (
                <DropdownMenuCheckboxItem
                  key={type}
                  checked={typeFilter === type}
                  onCheckedChange={() => setTypeFilter(type)}
                >
                  {type}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Custom Workflow
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        <WorkflowTabs 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
        />
        
        <Tabs value={activeTab} className="w-full">
          <TabsContent value="templates" className="mt-0">
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Predefined Workflow Templates</h2>
              
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : filteredTemplates.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredTemplates.map((workflow) => (
                    <WorkflowTemplateCard
                      key={workflow.id}
                      workflow={workflow}
                      onUseTemplate={useWorkflowTemplate}
                      onDuplicateTemplate={duplicateTemplate}
                      onEditTemplate={viewWorkflowDetails}
                      onDeleteTemplate={(id) => openDeleteDialog(id, workflow.name, true)}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  {searchTerm || typeFilter !== 'all' ? 
                    "No templates match your search criteria." : 
                    "No workflow templates available."}
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="active" className="mt-0">
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Active Workflows</h2>
              
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : filteredActiveWorkflows.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredActiveWorkflows.map((workflow) => (
                    <ActiveWorkflowCard
                      key={workflow.id}
                      workflow={workflow}
                      onViewDetails={viewWorkflowDetails}
                      onPauseWorkflow={pauseWorkflow}
                      onResumeWorkflow={resumeWorkflow}
                      onCancelWorkflow={(id) => openDeleteDialog(id, workflow.name, false)}
                      onEditWorkflow={viewWorkflowDetails}
                      onDeleteWorkflow={(id) => openDeleteDialog(id, workflow.name, false)}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  {searchTerm || typeFilter !== 'all' ? 
                    "No active workflows match your search criteria." : 
                    "No active workflows. Use a template to create a workflow."}
                </p>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="custom" className="mt-0">
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Custom Workflows</h2>
              <p className="text-muted-foreground">This feature is coming soon. Please check back later.</p>
            </div>
          </TabsContent>
          
          <TabsContent value="builder" className="mt-0">
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Workflow Builder</h2>
              <p className="text-muted-foreground">This feature is coming soon. Please check back later.</p>
            </div>
          </TabsContent>
          
          <TabsContent value="analytics" className="mt-0">
            <WorkflowAnalyticsDashboard 
              activeWorkflows={activeWorkflows}
              workflowTemplates={workflowTemplates}
            />
          </TabsContent>
        </Tabs>
      </div>

      <WorkflowCreateDialog 
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onCreateWorkflow={handleCreateWorkflow}
        isCreating={isCreating}
      />

      <WorkflowDeleteDialog
        open={deleteDialogState.isOpen}
        onOpenChange={(isOpen) => setDeleteDialogState(prev => ({ ...prev, isOpen }))}
        onConfirm={handleDelete}
        isDeleting={isDeleting}
        workflowName={deleteDialogState.workflowName}
        isTemplate={deleteDialogState.isTemplate}
      />
    </PageTemplate>
  );
};

export default Workflows;
