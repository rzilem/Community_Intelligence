
import React from 'react';
import { DollarSign } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import DashboardWidget from '@/components/portal/DashboardWidget';
import { Transaction } from '@/types/transaction-payment-types';
import { format } from 'date-fns';

interface RecentTransactionsWidgetProps {
  transactions: Transaction[];
}

export const RecentTransactionsWidget: React.FC<RecentTransactionsWidgetProps> = ({ transactions }) => {
  return (
    <DashboardWidget title="Recent Financial Activity" widgetType="recent_transactions">
      <div className="space-y-4">
        {transactions.slice(0, 5).map((transaction) => (
          <div 
            key={transaction.id}
            className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
          >
            <div className="space-y-1">
              <p className="text-sm font-medium">{transaction.description}</p>
              <p className="text-xs text-muted-foreground">
                {format(new Date(transaction.date), 'MMM d, yyyy')}
              </p>
            </div>
            <span className={`font-medium ${
              transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
            }`}>
              {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toFixed(2)}
            </span>
          </div>
        ))}
        {transactions.length === 0 && (
          <div className="text-center py-4 text-muted-foreground">
            No recent transactions
          </div>
        )}
      </div>
    </DashboardWidget>
  );
};
