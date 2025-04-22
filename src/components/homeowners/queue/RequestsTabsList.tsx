
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
  // Handle tab change if provided
  const handleTabChange = (value: string) => {
    if (onTabChange) {
      onTabChange(value);
    }
  };

  return (
    <div className="flex justify-between mb-6">
      <TabsList>
        <TabsTrigger 
          value="all" 
          onClick={() => handleTabChange("all")}
        >
          All Requests ({requestCounts.all || 0})
        </TabsTrigger>
        <TabsTrigger 
          value="open"
          onClick={() => handleTabChange("open")}
        >
          Open ({requestCounts.open || 0})
        </TabsTrigger>
        <TabsTrigger 
          value="in-progress"
          onClick={() => handleTabChange("in-progress")}
        >
          In Progress ({requestCounts.inProgress || 0})
        </TabsTrigger>
        <TabsTrigger 
          value="resolved"
          onClick={() => handleTabChange("resolved")}
        >
          Resolved ({requestCounts.closed || 0})
        </TabsTrigger>
        <TabsTrigger 
          value="closed"
          onClick={() => handleTabChange("closed")}
        >
          Closed ({requestCounts.closed || 0})
        </TabsTrigger>
      </TabsList>
    </div>
  );
};

export default RequestsTabsList;
