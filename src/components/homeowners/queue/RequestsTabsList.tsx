
import React from 'react';
import { TabsList, TabsTrigger } from '@/components/ui/tabs';

interface RequestsTabsListProps {
  requestCounts: {
    all: number;
    open: number;
    inProgress: number;
    closed: number;
    rejected: number;
  };
  activeTab: string;
  onTabChange?: (value: string) => void;
}

const RequestsTabsList: React.FC<RequestsTabsListProps> = ({ 
  requestCounts, 
  activeTab,
  onTabChange 
}) => {
  return (
    <div className="flex justify-between mb-6">
      <TabsList>
        <TabsTrigger 
          value="all" 
          className={activeTab === "all" ? "active" : ""}
        >
          All Requests ({requestCounts.all || 0})
        </TabsTrigger>
        <TabsTrigger 
          value="open"
          className={activeTab === "open" ? "active" : ""}
        >
          Open ({requestCounts.open || 0})
        </TabsTrigger>
        <TabsTrigger 
          value="in-progress"
          className={activeTab === "in-progress" ? "active" : ""}
        >
          In Progress ({requestCounts.inProgress || 0})
        </TabsTrigger>
        <TabsTrigger 
          value="resolved"
          className={activeTab === "resolved" ? "active" : ""}
        >
          Resolved ({requestCounts.closed || 0})
        </TabsTrigger>
        <TabsTrigger 
          value="closed"
          className={activeTab === "closed" ? "active" : ""}
        >
          Closed ({requestCounts.closed || 0})
        </TabsTrigger>
      </TabsList>
    </div>
  );
};

export default RequestsTabsList;
