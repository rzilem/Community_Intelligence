
import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface TemplatesFilterProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const TemplatesFilter: React.FC<TemplatesFilterProps> = ({
  activeTab,
  onTabChange
}) => {
  return (
    <Tabs value={activeTab} onValueChange={onTabChange}>
      <TabsList className="grid grid-cols-5 w-full sm:w-auto">
        <TabsTrigger value="all">All</TabsTrigger>
        <TabsTrigger value="hoa">HOA</TabsTrigger>
        <TabsTrigger value="condo">Condo</TabsTrigger>
        <TabsTrigger value="onsite-hoa">Onsite HOA</TabsTrigger>
        <TabsTrigger value="onsite-condo">Onsite Condo</TabsTrigger>
      </TabsList>
    </Tabs>
  );
};

export default TemplatesFilter;
