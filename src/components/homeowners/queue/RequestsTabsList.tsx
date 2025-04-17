
import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { HomeownerRequestStatus } from '@/types/homeowner-request-types';

interface RequestsTabsListProps {
  activeTab: HomeownerRequestStatus | 'all' | 'active';
  onTabChange: (value: string) => void;
}

const RequestsTabsList: React.FC<RequestsTabsListProps> = ({ activeTab, onTabChange }) => {
  return (
    <div className="flex justify-between mb-6">
      <TabsList>
        <TabsTrigger value="all">All Requests</TabsTrigger>
        <TabsTrigger value="active">Active</TabsTrigger>
        <TabsTrigger value="open">Open</TabsTrigger>
        <TabsTrigger value="in-progress">In Progress</TabsTrigger>
        <TabsTrigger value="resolved">Resolved</TabsTrigger>
        <TabsTrigger value="closed">Closed</TabsTrigger>
      </TabsList>
    </div>
  );
};

export default RequestsTabsList;
