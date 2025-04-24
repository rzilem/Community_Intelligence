import React, { useState } from 'react';
import PageTemplate from '@/components/layout/PageTemplate';
import { Database } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import GLAccountTabs from '@/components/accounting/GLAccountTabs';
import { useGLAccounts } from '@/hooks/accounting/useGLAccounts';
import { LoadingState } from '@/components/ui/loading-state';
import { EmptyState } from '@/components/ui/empty-state';
import GLAccountBalanceChart from '@/components/accounting/GLAccountBalanceChart';
import GLAccountsHeader from '@/components/accounting/gl-accounts/GLAccountsHeader';

const GLAccounts = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [accountType, setAccountType] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('master');
  const [selectedAssociationId, setSelectedAssociationId] = useState<string | undefined>();
  const [viewMode, setViewMode] = useState<'list' | 'chart'>('list');
  
  const {
    accounts,
    isLoading,
    error,
    refreshAccounts
  } = useGLAccounts({
    associationId: activeTab === 'association' ? selectedAssociationId : undefined,
    includeMaster: activeTab === 'master',
  });

  const handleAssociationChange = (associationId: string) => {
    setSelectedAssociationId(associationId);
  };

  const handleAccountAdded = (newAccount: any) => {
    refreshAccounts();
  };

  const handleCopyMasterToAssociation = async () => {
    if (!selectedAssociationId) {
      toast.error('Please select an association first');
      return;
    }

    try {
      const { data: masterAccounts, error: fetchError } = await supabase
        .from('gl_accounts')
        .select('*')
        .is('association_id', null);

      if (fetchError) {
        throw new Error(`Error fetching master accounts: ${fetchError.message}`);
      }

      if (!masterAccounts || masterAccounts.length === 0) {
        toast.warning('No master GL accounts found to copy');
        return;
      }

      const accountsToInsert = masterAccounts.map(account => ({
        code: account.code,
        name: account.name,
        type: account.type,
        description: account.description || account.name,
        category: account.category,
        balance: 0,
        association_id: selectedAssociationId
      }));

      const { data, error } = await supabase
        .from('gl_accounts')
        .insert(accountsToInsert)
        .select();

      if (error) {
        throw new Error(`Error copying GL accounts: ${error.message}`);
      }

      toast.success(`Successfully copied ${accountsToInsert.length} GL accounts to association`);
      
      refreshAccounts();
    } catch (err: any) {
      console.error('Error copying master GL accounts:', err);
      toast.error(err.message || 'Failed to copy GL accounts');
    }
  };

  return (
    <PageTemplate 
      title="GL Accounts" 
      icon={<Database className="h-8 w-8" />}
      description="Manage general ledger accounts and chart of accounts."
    >
      <Card>
        <CardHeader>
          <GLAccountsHeader
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            onAssociationChange={handleAssociationChange}
          />
        </CardHeader>
        <CardContent>
          {viewMode === 'list' ? (
            <GLAccountTabs
              activeTab={activeTab}
              onTabChange={setActiveTab}
              accounts={accounts}
              searchTerm={searchTerm}
              accountType={accountType}
              onSearchChange={setSearchTerm}
              onAccountTypeChange={setAccountType}
              onAccountAdded={handleAccountAdded}
              selectedAssociationId={selectedAssociationId}
              onCopyMasterToAssociation={handleCopyMasterToAssociation}
            />
          ) : (
            <div className="space-y-6">
              {accounts.length > 0 ? (
                <>
                  <GLAccountBalanceChart 
                    accounts={accounts}
                    title="Top Account Balances" 
                    description="Highest balance GL accounts"
                    limit={10}
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <GLAccountBalanceChart 
                      accounts={accounts}
                      title="Top Assets" 
                      description="Highest balance asset accounts"
                      limit={5}
                      type="Asset"
                    />
                    <GLAccountBalanceChart 
                      accounts={accounts}
                      title="Top Liabilities" 
                      description="Highest balance liability accounts"
                      limit={5}
                      type="Liability"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <GLAccountBalanceChart 
                      accounts={accounts}
                      title="Top Revenue" 
                      description="Highest balance revenue accounts"
                      limit={5}
                      type="Revenue"
                    />
                    <GLAccountBalanceChart 
                      accounts={accounts}
                      title="Top Expenses" 
                      description="Highest balance expense accounts"
                      limit={5}
                      type="Expense"
                    />
                  </div>
                </>
              ) : (
                <EmptyState 
                  title="No GL accounts found"
                  description="No GL accounts available to display in charts"
                />
              )}
            </div>
          )}
          
          {isLoading && <LoadingState variant="spinner" text="Loading GL accounts..." />}
          
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

export default GLAccounts;
