
import React from 'react';
import { Money } from 'lucide-react';
import PageTemplate from '@/components/layout/PageTemplate';
import { useSupabaseQuery } from '@/hooks/supabase';
import { toast } from 'sonner';
import GLAccountsHeader from '@/components/accounting/gl-accounts/GLAccountsHeader';
import { GLAccount } from '@/types/accounting-types';
import { GLAccountsTable } from '@/components/accounting/GLAccountsTable';
import { GLAccountDialog } from '@/components/accounting/GLAccountDialog';
import { GLAccountDetailDialog } from '@/components/accounting/GLAccountDetailDialog';
import { GLAccountCategories } from '@/components/accounting/GLAccountCategories';
import { GLAccountGroups } from '@/components/accounting/GLAccountGroups';
import { GLAccountBalanceChart } from '@/components/accounting/GLAccountBalanceChart';
import { GLAccountTabs } from '@/components/accounting/GLAccountTabs';
import { useAuth } from '@/contexts/auth';

const GLAccounts = () => {
  const [viewMode, setViewMode] = React.useState<'list' | 'chart'>('list');
  const [selectedAssociationId, setSelectedAssociationId] = React.useState<string>('');
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

  return (
    <PageTemplate
      title="Chart of Accounts"
      icon={<Money className="h-8 w-8" />}
      description="Manage your general ledger accounts and chart of accounts structure"
    >
      <div className="space-y-6">
        <GLAccountsHeader
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onAssociationChange={setSelectedAssociationId}
        />

        <GLAccountTabs
          accounts={accounts}
          isLoading={isLoading}
          viewMode={viewMode}
        />
      </div>
    </PageTemplate>
  );
};

export default GLAccounts;
