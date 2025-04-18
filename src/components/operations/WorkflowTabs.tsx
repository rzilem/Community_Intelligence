
import React from 'react';
import { Input } from '@/components/ui/input';
import { TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search } from 'lucide-react';

interface WorkflowTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

const WorkflowTabs: React.FC<WorkflowTabsProps> = ({
  activeTab,
  setActiveTab,
  searchTerm,
  onSearchChange
}) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between space-y-4 sm:space-y-0">
      <TabsList className="grid grid-cols-5 w-full sm:w-auto">
        <TabsTrigger value="templates" onClick={() => setActiveTab('templates')}>
          Templates
        </TabsTrigger>
        <TabsTrigger value="active" onClick={() => setActiveTab('active')}>
          Active
        </TabsTrigger>
        <TabsTrigger value="custom" onClick={() => setActiveTab('custom')}>
          Custom
        </TabsTrigger>
        <TabsTrigger value="builder" onClick={() => setActiveTab('builder')}>
          Builder
        </TabsTrigger>
        <TabsTrigger value="analytics" onClick={() => setActiveTab('analytics')}>
          Analytics
        </TabsTrigger>
      </TabsList>
      
      <div className="relative w-full sm:w-[300px]">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search workflows..."
          className="pl-8"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
    </div>
  );
};

export default WorkflowTabs;
