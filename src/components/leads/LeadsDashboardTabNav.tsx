
import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface LeadsDashboardTabNavProps {
  activeTab: string;
  onChange: (value: string) => void;
}

const LeadsDashboardTabNav: React.FC<LeadsDashboardTabNavProps> = ({
  activeTab,
  onChange
}) => {
  return (
    <Tabs value={activeTab} onValueChange={onChange} className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="active-leads">Active Leads</TabsTrigger>
        <TabsTrigger value="proposal-templates">Proposal Templates</TabsTrigger>
        <TabsTrigger value="follow-up-emails">Follow-up Emails</TabsTrigger>
        <TabsTrigger value="analytics">Analytics</TabsTrigger>
      </TabsList>
    </Tabs>
  );
};

export default LeadsDashboardTabNav;
