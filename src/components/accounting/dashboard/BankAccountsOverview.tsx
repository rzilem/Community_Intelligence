
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BankAccount } from '@/types/bank-statement-types';
import { DollarSign } from 'lucide-react';

interface BankAccountsOverviewProps {
  accounts: BankAccount[];
}

export const BankAccountsOverview = ({ accounts }: BankAccountsOverviewProps) => {
  const totalBalance = accounts.reduce((sum, account) => {
    const balance = parseFloat(account.last_statement_date || '0');
    return sum + (isNaN(balance) ? 0 : balance);
  }, 0);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${totalBalance.toLocaleString()}</div>
        </CardContent>
      </Card>
      
      {accounts.map((account) => (
        <Card key={account.id}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{account.name}</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${parseFloat(account.last_statement_date || '0').toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Last reconciled: {account.last_reconciled_date || 'Never'}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
