
import React, { useState } from 'react';
import PageTemplate from '@/components/layout/PageTemplate';
import { Workflow as WorkflowIcon, Plus } from 'lucide-react';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import WorkflowTabs from '@/components/operations/WorkflowTabs';
import WorkflowTemplateCard from '@/components/operations/WorkflowTemplateCard';
import { useWorkflows } from '@/hooks/operations/useWorkflows';

const Workflows = () => {
  const [activeTab, setActiveTab] = useState<string>('templates');
  const { 
    workflowTemplates, 
    loading, 
    useWorkflowTemplate, 
    createCustomTemplate 
  } = useWorkflows();

  return (
    <PageTemplate 
      title="Workflow Management" 
      icon={<WorkflowIcon className="h-8 w-8" />}
      description="Create and manage automated workflows for your association processes"
      actions={
        <Button onClick={createCustomTemplate}>
          <Plus className="mr-2 h-4 w-4" />
          Create Custom Template
        </Button>
      }
    >
      <div className="space-y-6">
        <WorkflowTabs activeTab={activeTab} setActiveTab={setActiveTab} />
        
        <Tabs value={activeTab} className="w-full">
          <TabsContent value="templates" className="mt-0">
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Predefined Workflow Templates</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {workflowTemplates.map((workflow) => (
                  <WorkflowTemplateCard
                    key={workflow.id}
                    workflow={workflow}
                    onUseTemplate={useWorkflowTemplate}
                  />
                ))}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="active" className="mt-0">
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Active Workflows</h2>
              <p>This feature is coming soon. Please check back later.</p>
            </div>
          </TabsContent>
          
          <TabsContent value="custom" className="mt-0">
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Custom Workflows</h2>
              <p>This feature is coming soon. Please check back later.</p>
            </div>
          </TabsContent>
          
          <TabsContent value="builder" className="mt-0">
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Workflow Builder</h2>
              <p>This feature is coming soon. Please check back later.</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </PageTemplate>
  );
};

export default Workflows;
