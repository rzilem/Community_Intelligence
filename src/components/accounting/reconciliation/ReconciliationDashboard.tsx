
import React from 'react';
import { BankReconciliationCard } from './BankReconciliationCard';
import { BankAccount } from '@/types/bank-statement-types';

interface ReconciliationDashboardProps {
  bankAccounts: BankAccount[];
  onReconcileAccount: (accountId: string) => void;
}

export const ReconciliationDashboard: React.FC<ReconciliationDashboardProps> = ({
  bankAccounts,
  onReconcileAccount,
}) => {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {bankAccounts.map((account) => (
        <BankReconciliationCard
          key={account.id}
          bankAccount={account}
          onReconcile={() => onReconcileAccount(account.id)}
        />
      ))}
      {bankAccounts.length === 0 && (
        <div className="col-span-full text-center py-8 text-muted-foreground">
          No bank accounts configured
        </div>
      )}
    </div>
  );
};
