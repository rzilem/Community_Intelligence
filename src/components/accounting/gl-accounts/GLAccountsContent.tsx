
import React from 'react';
import { CardContent } from '@/components/ui/card';
import GLAccountTabs from '@/components/accounting/GLAccountTabs';
import { LoadingState } from '@/components/ui/loading-state';
import { EmptyState } from '@/components/ui/empty-state';
import { GLAccount } from '@/types/accounting-types';

interface GLAccountsContentProps {
  activeTab: string;
  onTabChange: (value: string) => void;
  accounts: GLAccount[];
  searchTerm: string;
  accountType: string;
  onSearchChange: (value: string) => void;
  onAccountTypeChange: (value: string) => void;
  selectedAssociationId?: string;
  isLoading: boolean;
  error?: Error;
}

export const GLAccountsContent: React.FC<GLAccountsContentProps> = ({
  activeTab,
  onTabChange,
  accounts,
  searchTerm,
  accountType,
  onSearchChange,
  onAccountTypeChange,
  selectedAssociationId,
  isLoading,
  error
}) => {
  return (
    <CardContent>
      <GLAccountTabs
        activeTab={activeTab}
        onTabChange={onTabChange}
        accounts={accounts}
        searchTerm={searchTerm}
        accountType={accountType}
        onSearchChange={onSearchChange}
        onAccountTypeChange={onAccountTypeChange}
        selectedAssociationId={selectedAssociationId}
      />
      
      {isLoading && (
        <LoadingState variant="spinner" text="Loading GL accounts..." />
      )}
      
      {error && (
        <EmptyState 
          title="Failed to load GL accounts" 
          description={error.message}
        />
      )}
    </CardContent>
  );
};
