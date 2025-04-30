
import React from 'react';
import { Database } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import GLAccountsTable from './GLAccountsTable';
import { GLAccount } from '@/types/accounting-types';

interface GLAccountTabsProps {
  activeTab: string;
  onTabChange: (value: string) => void;
  accounts: GLAccount[];
  searchTerm: string;
  accountType: string;
  visibleColumns: Array<'code' | 'description' | 'type' | 'category'>;
  onSearchChange: (value: string) => void;
  onAccountTypeChange: (value: string) => void;
  onColumnChange: (columns: string[]) => void;
}

const GLAccountTabs: React.FC<GLAccountTabsProps> = ({
  activeTab,
  onTabChange,
  accounts,
  searchTerm,
  accountType,
  visibleColumns,
  onSearchChange,
  onAccountTypeChange,
  onColumnChange
}) => {
  return (
    <Tabs defaultValue="master" className="w-full" value={activeTab} onValueChange={onTabChange}>
      <TabsList className="mb-6">
        <TabsTrigger value="master">
          <Database className="h-4 w-4 mr-2" />
          Master GL List
        </TabsTrigger>
        <TabsTrigger value="association">
          <Database className="h-4 w-4 mr-2" />
          Association GL
        </TabsTrigger>
      </TabsList>

      <TabsContent value="master">
        <GLAccountsTable
          accounts={accounts}
          searchTerm={searchTerm}
          accountType={accountType}
          visibleColumns={visibleColumns}
          onSearchChange={onSearchChange}
          onAccountTypeChange={onAccountTypeChange}
          onColumnChange={onColumnChange}
        />
      </TabsContent>

      <TabsContent value="association">
        <div className="p-4 text-center text-muted-foreground">
          Association-specific GL accounts will appear here.
        </div>
      </TabsContent>
    </Tabs>
  );
};

export default GLAccountTabs;
