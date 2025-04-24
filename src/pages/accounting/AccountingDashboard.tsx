
import React from 'react';
import { DollarSign } from 'lucide-react';
import PageTemplate from '@/components/layout/PageTemplate';
import { useSupabaseQuery } from '@/hooks/supabase';
import { Transaction } from '@/types/transaction-payment-types';
import { BankAccount } from '@/types/bank-statement-types';
import { RecentTransactionsWidget } from '@/components/accounting/dashboard/RecentTransactionsWidget';
import { ReconciliationDashboard } from '@/components/accounting/reconciliation/ReconciliationDashboard';

const AccountingDashboard = () => {
  // Fetch transactions data
  const { data: transactions = [] } = useSupabaseQuery<Transaction[]>(
    'transactions',
    {
      select: '*',
      order: { column: 'date', ascending: false },
      limit: 5
    }
  );

  // Fetch bank accounts data
  const { data: bankAccounts = [] } = useSupabaseQuery<BankAccount[]>(
    'bank_accounts',
    {
      select: '*'
    }
  );

  const handleReconcileAccount = (accountId: string) => {
    console.log('Reconcile account:', accountId);
    // Will be implemented when we add reconciliation functionality
  };

  return (
    <PageTemplate
      title="Accounting Dashboard"
      icon={<DollarSign className="h-8 w-8" />}
      description="Overview of your financial activity and reconciliation status"
    >
      <div className="space-y-6">
        {/* Bank Reconciliation Section */}
        <section>
          <h2 className="text-lg font-semibold mb-4">Bank Reconciliation</h2>
          <ReconciliationDashboard 
            bankAccounts={bankAccounts}
            onReconcileAccount={handleReconcileAccount}
          />
        </section>

        {/* Recent Transactions Section */}
        <section>
          <RecentTransactionsWidget transactions={transactions} />
        </section>
      </div>
    </PageTemplate>
  );
};

export default AccountingDashboard;
