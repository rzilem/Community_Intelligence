
import React from 'react';
import { CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChartBar } from 'lucide-react';
import AssociationSelector from '@/components/associations/AssociationSelector';

interface GLAccountsHeaderProps {
  viewMode: 'list' | 'chart';
  onViewModeChange: (value: 'list' | 'chart') => void;
  onAssociationChange: (associationId: string) => void;
}

const GLAccountsHeader: React.FC<GLAccountsHeaderProps> = ({
  viewMode,
  onViewModeChange,
  onAssociationChange
}) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <CardTitle>Chart of Accounts</CardTitle>
        <CardDescription>Manage general ledger accounts for your associations</CardDescription>
      </div>
      <div className="flex gap-4 items-center">
        <Tabs 
          value={viewMode} 
          onValueChange={(value) => onViewModeChange(value as 'list' | 'chart')}
          className="mr-4"
        >
          <TabsList className="grid w-[180px] grid-cols-2">
            <TabsTrigger value="list">List View</TabsTrigger>
            <TabsTrigger value="chart">
              <ChartBar className="h-4 w-4 mr-1" />
              Chart View
            </TabsTrigger>
          </TabsList>
        </Tabs>
        <AssociationSelector 
          className="md:self-end" 
          onAssociationChange={onAssociationChange}
        />
      </div>
    </div>
  );
};

export default GLAccountsHeader;
