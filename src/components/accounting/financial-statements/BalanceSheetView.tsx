
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';

interface BalanceSheetProps {
  data: {
    statementName: string;
    asOfDate: string;
    assets: {
      accounts: Array<{id: string; name: string; code: string; balance: number}>;
      total: number;
    };
    liabilities: {
      accounts: Array<{id: string; name: string; code: string; balance: number}>;
      total: number;
    };
    equity: {
      accounts: Array<{id: string; name: string; code: string; balance: number}>;
      total: number;
    };
    createdAt: string;
  };
}

const BalanceSheetView: React.FC<BalanceSheetProps> = ({ data }) => {
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
          As of {format(new Date(data.asOfDate), 'MMMM d, yyyy')}
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Assets Section */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Assets</h3>
            <div className="space-y-1">
              {data.assets.accounts.map(account => (
                <div key={account.id} className="flex justify-between">
                  <span className="text-muted-foreground">{account.name} ({account.code})</span>
                  <span>{formatCurrency(account.balance)}</span>
                </div>
              ))}
              <div className="flex justify-between font-medium border-t pt-1">
                <span>Total Assets</span>
                <span>{formatCurrency(data.assets.total)}</span>
              </div>
            </div>
          </div>

          {/* Liabilities Section */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Liabilities</h3>
            <div className="space-y-1">
              {data.liabilities.accounts.map(account => (
                <div key={account.id} className="flex justify-between">
                  <span className="text-muted-foreground">{account.name} ({account.code})</span>
                  <span>{formatCurrency(account.balance)}</span>
                </div>
              ))}
              <div className="flex justify-between font-medium border-t pt-1">
                <span>Total Liabilities</span>
                <span>{formatCurrency(data.liabilities.total)}</span>
              </div>
            </div>
          </div>

          {/* Equity Section */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Equity</h3>
            <div className="space-y-1">
              {data.equity.accounts.map(account => (
                <div key={account.id} className="flex justify-between">
                  <span className="text-muted-foreground">{account.name} ({account.code})</span>
                  <span>{formatCurrency(account.balance)}</span>
                </div>
              ))}
              <div className="flex justify-between font-medium border-t pt-1">
                <span>Total Equity</span>
                <span>{formatCurrency(data.equity.total)}</span>
              </div>
            </div>
          </div>

          {/* Verify Balance */}
          <div className="border-t border-t-2 pt-2">
            <div className="flex justify-between font-semibold text-lg">
              <span>Total Liabilities and Equity</span>
              <span>{formatCurrency(data.liabilities.total + data.equity.total)}</span>
            </div>
            {data.assets.total === (data.liabilities.total + data.equity.total) ? (
              <p className="text-green-600 text-sm text-right mt-1">Balance sheet is balanced</p>
            ) : (
              <p className="text-red-600 text-sm text-right mt-1">
                Balance sheet is not balanced: Difference {formatCurrency(data.assets.total - (data.liabilities.total + data.equity.total))}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BalanceSheetView;
