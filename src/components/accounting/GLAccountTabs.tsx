
import React from 'react';
import { Database, Copy } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import GLAccountsTable from './GLAccountsTable';
import { GLAccount } from '@/types/accounting-types';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface GLAccountTabsProps {
  activeTab: string;
  onTabChange: (value: string) => void;
  accounts: GLAccount[];
  searchTerm: string;
  accountType: string;
  onSearchChange: (value: string) => void;
  onAccountTypeChange: (value: string) => void;
  onAccountAdded?: (account: GLAccount) => void;
  selectedAssociationId?: string;
  onCopyMasterToAssociation?: () => void;
}

const GLAccountTabs: React.FC<GLAccountTabsProps> = ({
  activeTab,
  onTabChange,
  accounts,
  searchTerm,
  accountType,
  onSearchChange,
  onAccountTypeChange,
  onAccountAdded,
  selectedAssociationId,
  onCopyMasterToAssociation
}) => {
  return (
    <Tabs defaultValue="master" className="w-full" value={activeTab} onValueChange={onTabChange}>
      <div className="flex justify-between items-center mb-6">
        <TabsList>
          <TabsTrigger value="master">
            <Database className="h-4 w-4 mr-2" />
            Master GL List
          </TabsTrigger>
          <TabsTrigger value="association">
            <Database className="h-4 w-4 mr-2" />
            Association GL
          </TabsTrigger>
        </TabsList>
        
        {activeTab === 'association' && selectedAssociationId && onCopyMasterToAssociation && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={onCopyMasterToAssociation}
                  className="ml-2"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Master to Association
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Copy all master GL accounts to this association</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>

      <TabsContent value="master">
        <GLAccountsTable
          accounts={accounts}
          searchTerm={searchTerm}
          accountType={accountType}
          onSearchChange={onSearchChange}
          onAccountTypeChange={onAccountTypeChange}
          onAccountAdded={onAccountAdded}
        />
      </TabsContent>

      <TabsContent value="association">
        {!selectedAssociationId ? (
          <div className="p-4 text-center text-muted-foreground">
            Please select an association to view or manage its GL accounts.
          </div>
        ) : accounts.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">
            <p className="mb-4">No association-specific GL accounts found.</p>
            <p>You can add association-specific GL accounts or copy all master accounts to this association.</p>
          </div>
        ) : (
          <GLAccountsTable
            accounts={accounts}
            searchTerm={searchTerm}
            accountType={accountType}
            onSearchChange={onSearchChange}
            onAccountTypeChange={onAccountTypeChange}
            onAccountAdded={onAccountAdded}
          />
        )}
      </TabsContent>
    </Tabs>
  );
};

export default GLAccountTabs;
