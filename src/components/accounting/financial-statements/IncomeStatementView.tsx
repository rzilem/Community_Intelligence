
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';

interface IncomeStatementProps {
  data: {
    statementName: string;
    periodStart: string;
    periodEnd: string;
    revenue: {
      accounts: Array<{id: string; name: string; code: string; balance: number}>;
      total: number;
    };
    expenses: {
      accounts: Array<{id: string; name: string; code: string; balance: number}>;
      total: number;
    };
    netIncome: number;
    createdAt: string;
  };
}

const IncomeStatementView: React.FC<IncomeStatementProps> = ({ data }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD'
    }).format(amount);
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-2xl text-center">{data.statementName}</CardTitle>
        <p className="text-center text-muted-foreground">
          {format(new Date(data.periodStart), 'MMM d, yyyy')} to {format(new Date(data.periodEnd), 'MMM d, yyyy')}
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Revenue Section */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Revenue</h3>
            <div className="space-y-1">
              {data.revenue.accounts.map(account => (
                <div key={account.id} className="flex justify-between">
                  <span className="text-muted-foreground">{account.name} ({account.code})</span>
                  <span>{formatCurrency(account.balance)}</span>
                </div>
              ))}
              <div className="flex justify-between font-medium border-t pt-1">
                <span>Total Revenue</span>
                <span>{formatCurrency(data.revenue.total)}</span>
              </div>
            </div>
          </div>

          {/* Expenses Section */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Expenses</h3>
            <div className="space-y-1">
              {data.expenses.accounts.map(account => (
                <div key={account.id} className="flex justify-between">
                  <span className="text-muted-foreground">{account.name} ({account.code})</span>
                  <span>{formatCurrency(account.balance)}</span>
                </div>
              ))}
              <div className="flex justify-between font-medium border-t pt-1">
                <span>Total Expenses</span>
                <span>{formatCurrency(data.expenses.total)}</span>
              </div>
            </div>
          </div>

          {/* Net Income */}
          <div className="border-t border-t-2 pt-2">
            <div className="flex justify-between font-semibold text-lg">
              <span>Net Income</span>
              <span className={data.netIncome >= 0 ? "text-green-600" : "text-red-600"}>
                {formatCurrency(data.netIncome)}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default IncomeStatementView;
