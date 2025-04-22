
import React from 'react';
import { TabsList, TabsTrigger } from '@/components/ui/tabs';
import { HomeownerRequestStatus } from '@/types/homeowner-request-types';

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
        <TabsTrigger value="all">
          All Requests ({requestCounts.all || 0})
        </TabsTrigger>
        <TabsTrigger value="open">
          Open ({requestCounts.open || 0})
        </TabsTrigger>
        <TabsTrigger value="in-progress">
          In Progress ({requestCounts.inProgress || 0})
        </TabsTrigger>
        <TabsTrigger value="resolved">
          Resolved ({requestCounts.closed || 0})
        </TabsTrigger>
        <TabsTrigger value="closed">
          Closed ({requestCounts.closed || 0})
        </TabsTrigger>
      </TabsList>
    </div>
  );
};

export default RequestsTabsList;
