
import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface WorkflowTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const WorkflowTabs: React.FC<WorkflowTabsProps> = ({ activeTab, setActiveTab }) => {
  return (
    <div className="mb-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full grid grid-cols-4">
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="active">Active Workflows</TabsTrigger>
          <TabsTrigger value="custom">Custom Workflows</TabsTrigger>
          <TabsTrigger value="builder">Workflow Builder</TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
};

export default WorkflowTabs;
