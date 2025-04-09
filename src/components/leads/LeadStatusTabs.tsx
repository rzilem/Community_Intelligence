
import React from 'react';
import { TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

interface LeadStats {
  all: number;
  new: number;
  contacted: number;
  qualified: number;
  proposal: number;
  converted: number;
  lost: number;
}

interface LeadStatusTabsProps {
  leadCounts: LeadStats;
  activeTab: string;
}

const LeadStatusTabs: React.FC<LeadStatusTabsProps> = ({
  leadCounts,
  activeTab
}) => {
  return (
    <TabsList>
      <TabsTrigger value="all" className="flex gap-2 items-center">
        All
        <Badge variant="outline">{leadCounts.all}</Badge>
      </TabsTrigger>
      <TabsTrigger value="new" className="flex gap-2 items-center">
        New
        <Badge variant="outline">{leadCounts.new}</Badge>
      </TabsTrigger>
      <TabsTrigger value="contacted" className="flex gap-2 items-center">
        Contacted
        <Badge variant="outline">{leadCounts.contacted}</Badge>
      </TabsTrigger>
      <TabsTrigger value="qualified" className="flex gap-2 items-center">
        Qualified
        <Badge variant="outline">{leadCounts.qualified}</Badge>
      </TabsTrigger>
      <TabsTrigger value="proposal" className="flex gap-2 items-center">
        Proposal
        <Badge variant="outline">{leadCounts.proposal}</Badge>
      </TabsTrigger>
      <TabsTrigger value="converted" className="flex gap-2 items-center">
        Converted
        <Badge variant="outline">{leadCounts.converted}</Badge>
      </TabsTrigger>
      <TabsTrigger value="lost" className="flex gap-2 items-center">
        Lost
        <Badge variant="outline">{leadCounts.lost}</Badge>
      </TabsTrigger>
    </TabsList>
  );
};

export default LeadStatusTabs;
