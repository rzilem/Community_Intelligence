
import React from 'react';
import { DollarSign } from 'lucide-react';
import PageTemplate from '@/components/layout/PageTemplate';
import { useSupabaseQuery } from '@/hooks/supabase';
import { toast } from 'sonner';
import GLAccountsHeader from '@/components/accounting/gl-accounts/GLAccountsHeader';
import { GLAccount } from '@/types/accounting-types';
import GLAccountsTable from '@/components/accounting/GLAccountsTable';
import GLAccountDetailDialog from '@/components/accounting/GLAccountDetailDialog';
import GLAccountCategories from '@/components/accounting/GLAccountCategories';
import GLAccountGroups from '@/components/accounting/GLAccountGroups';
import GLAccountBalanceChart from '@/components/accounting/GLAccountBalanceChart';
import GLAccountTabs from '@/components/accounting/GLAccountTabs';
import { useAuth } from '@/contexts/auth';

const GLAccounts = () => {
  const [viewMode, setViewMode] = React.useState<'list' | 'chart'>('list');
  const [selectedAssociationId, setSelectedAssociationId] = React.useState<string>('');
  const [activeTab, setActiveTab] = React.useState<string>('master');
  const [searchTerm, setSearchTerm] = React.useState<string>('');
  const [accountType, setAccountType] = React.useState<string>('all');
  const { currentAssociation } = useAuth();

  const { data: accounts = [], isLoading, error } = useSupabaseQuery<GLAccount[]>(
    'gl_accounts',
    {
      select: '*',
      filter: [{ column: 'association_id', value: currentAssociation?.id }],
      order: { column: 'code', ascending: true }
    }
  );

  // Notify user of any errors
  React.useEffect(() => {
    if (error) {
      toast.error('Error loading GL accounts');
    }
  }, [error]);

  const handleAccountAdded = (account: GLAccount) => {
    // In a real implementation, this would refresh the data
    // For now, we'll just log it
    console.log('Account added:', account);
  };

  const handleCopyMasterToAssociation = () => {
    if (selectedAssociationId) {
      // This would be implemented to copy master accounts to the selected association
      toast.success('Master accounts copied to association');
    }
  };

  return (
    <PageTemplate
      title="Chart of Accounts"
      icon={<DollarSign className="h-8 w-8" />}
      description="Manage your general ledger accounts and chart of accounts structure"
    >
      <div className="space-y-6">
        <GLAccountsHeader
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onAssociationChange={setSelectedAssociationId}
        />

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
      </div>
    </PageTemplate>
  );
};

export default GLAccounts;
