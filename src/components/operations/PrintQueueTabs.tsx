
import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface PrintQueueTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const PrintQueueTabs: React.FC<PrintQueueTabsProps> = ({ activeTab, setActiveTab }) => {
  return (
    <div className="mb-4">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="queue">Queue</TabsTrigger>
          <TabsTrigger value="jobs">Jobs</TabsTrigger>
          <TabsTrigger value="thirdParty">Third Party Orders</TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
};

export default PrintQueueTabs;
