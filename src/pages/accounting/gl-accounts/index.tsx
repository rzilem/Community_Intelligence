
import React from 'react';
import { useRouter } from 'next/router';
import PageTemplate from '@/components/layout/PageTemplate';
import { Database } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AssociationSelector from '@/components/associations/AssociationSelector';
import GLAccountTabs from '@/components/accounting/GLAccountTabs';
import { useGLAccounts } from '@/hooks/accounting/useGLAccounts';
import { LoadingState } from '@/components/ui/loading-state';
import { EmptyState } from '@/components/ui/empty-state';

const GLAccountsPage = () => {
  const [selectedAssociationId, setSelectedAssociationId] = React.useState<string>();
  const [searchTerm, setSearchTerm] = React.useState('');
  const [accountType, setAccountType] = React.useState<string>('all');
  const [activeTab, setActiveTab] = React.useState('master');

  const {
    accounts,
    isLoading,
    error,
    createGLAccount,
    updateGLAccount
  } = useGLAccounts({
    associationId: activeTab === 'association' ? selectedAssociationId : undefined,
    includeMaster: activeTab === 'master',
  });

  const handleAssociationChange = (associationId: string) => {
    setSelectedAssociationId(associationId);
  };

  return (
    <PageTemplate 
      title="GL Accounts" 
      icon={<Database className="h-8 w-8" />}
      description="Manage general ledger accounts and chart of accounts."
    >
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle>Chart of Accounts</CardTitle>
              <CardDescription>Manage general ledger accounts for your associations</CardDescription>
            </div>
            <AssociationSelector 
              className="md:self-end" 
              onAssociationChange={handleAssociationChange}
            />
          </div>
        </CardHeader>
        <CardContent>
          <GLAccountTabs
            activeTab={activeTab}
            onTabChange={setActiveTab}
            accounts={accounts}
            searchTerm={searchTerm}
            accountType={accountType}
            onSearchChange={setSearchTerm}
            onAccountTypeChange={setAccountType}
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
      </Card>
    </PageTemplate>
  );
};

export default GLAccountsPage;
