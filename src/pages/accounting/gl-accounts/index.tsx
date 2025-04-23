
import React from 'react';
import PageTemplate from '@/components/layout/PageTemplate';
import { Database } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useGLAccounts } from '@/hooks/accounting/useGLAccounts';
import { GLAccountsHeader } from '@/components/accounting/gl-accounts/GLAccountsHeader';
import { GLAccountsContent } from '@/components/accounting/gl-accounts/GLAccountsContent';

const GLAccountsPage = () => {
  const [selectedAssociationId, setSelectedAssociationId] = React.useState<string>();
  const [searchTerm, setSearchTerm] = React.useState('');
  const [accountType, setAccountType] = React.useState<string>('all');
  const [activeTab, setActiveTab] = React.useState('master');

  const {
    accounts,
    isLoading,
    error,
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
        <GLAccountsHeader onAssociationChange={handleAssociationChange} />
        <GLAccountsContent 
          activeTab={activeTab}
          onTabChange={setActiveTab}
          accounts={accounts}
          searchTerm={searchTerm}
          accountType={accountType}
          onSearchChange={setSearchTerm}
          onAccountTypeChange={setAccountType}
          selectedAssociationId={selectedAssociationId}
          isLoading={isLoading}
          error={error}
        />
      </Card>
    </PageTemplate>
  );
};

export default GLAccountsPage;
