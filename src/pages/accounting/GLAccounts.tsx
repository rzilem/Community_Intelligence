
import React, { useState, useEffect } from 'react';
import PageTemplate from '@/components/layout/PageTemplate';
import { Database, ChartBar } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AssociationSelector from '@/components/associations/AssociationSelector';
import GLAccountTabs from '@/components/accounting/GLAccountTabs';
import { GLAccount } from '@/types/accounting-types';
import { useAuth } from '@/contexts/auth/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useGLAccounts } from '@/hooks/accounting/useGLAccounts';
import { LoadingState } from '@/components/ui/loading-state';
import { EmptyState } from '@/components/ui/empty-state';
import GLAccountBalanceChart from '@/components/accounting/GLAccountBalanceChart';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

const GLAccounts = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [accountType, setAccountType] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('master');
  const [selectedAssociationId, setSelectedAssociationId] = useState<string | undefined>();
  const [viewMode, setViewMode] = useState<'list' | 'chart'>('list');
  
  // Use the hook based on active tab and selected association
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

  const handleAccountAdded = (newAccount: GLAccount) => {
    refreshAccounts();
  };

  // Function to copy master GL accounts to an association
  const handleCopyMasterToAssociation = async () => {
    if (!selectedAssociationId) {
      toast.error('Please select an association first');
      return;
    }

    try {
      // 1. Fetch all master GL accounts
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

      // 2. Prepare data for insert - clone accounts but set association_id
      const accountsToInsert = masterAccounts.map(account => ({
        code: account.code,
        name: account.name,
        type: account.type,
        description: account.description || account.name,
        category: account.category,
        balance: 0,
        association_id: selectedAssociationId
      }));

      // 3. Insert association-specific GL accounts
      const { data, error } = await supabase
        .from('gl_accounts')
        .insert(accountsToInsert)
        .select();

      if (error) {
        throw new Error(`Error copying GL accounts: ${error.message}`);
      }

      toast.success(`Successfully copied ${accountsToInsert.length} GL accounts to association`);
      
      // Refresh the accounts list
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
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle>Chart of Accounts</CardTitle>
              <CardDescription>Manage general ledger accounts for your associations</CardDescription>
            </div>
            <div className="flex gap-4 items-center">
              <Tabs 
                value={viewMode} 
                onValueChange={(value) => setViewMode(value as 'list' | 'chart')}
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
                onAssociationChange={handleAssociationChange}
              />
            </div>
          </div>
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
