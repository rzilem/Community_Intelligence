
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { Transaction } from '@/types/transaction-payment-types';

interface TransactionSummaryCardsProps {
  transactions: Transaction[];
}

const TransactionSummaryCards: React.FC<TransactionSummaryCardsProps> = ({ transactions }) => {
  const incomeTransactions = transactions.filter(t => t.type === 'income');
  const expenseTransactions = transactions.filter(t => t.type === 'expense');
  
  const totalIncome = incomeTransactions.reduce((sum, t) => sum + t.amount, 0).toFixed(2);
  const totalExpense = expenseTransactions.reduce((sum, t) => sum + t.amount, 0).toFixed(2);
  const netCashFlow = (parseFloat(totalIncome) - parseFloat(totalExpense)).toFixed(2);
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-green-800">Total Income</h3>
            <ArrowUp className="h-4 w-4 text-green-600" />
          </div>
          <p className="text-2xl font-bold text-green-700">${totalIncome}</p>
          <p className="text-xs text-green-600 mt-1">From {incomeTransactions.length} transactions</p>
        </CardContent>
      </Card>
      
      <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-red-800">Total Expenses</h3>
            <ArrowDown className="h-4 w-4 text-red-600" />
          </div>
          <p className="text-2xl font-bold text-red-700">${totalExpense}</p>
          <p className="text-xs text-red-600 mt-1">From {expenseTransactions.length} transactions</p>
        </CardContent>
      </Card>
      
      <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-blue-800">Net Cash Flow</h3>
            {parseFloat(netCashFlow) >= 0 ? 
              <ArrowUp className="h-4 w-4 text-blue-600" /> : 
              <ArrowDown className="h-4 w-4 text-red-600" />
            }
          </div>
          <p className="text-2xl font-bold text-blue-700">${netCashFlow}</p>
          <p className="text-xs text-blue-600 mt-1">From {transactions.length} total transactions</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default TransactionSummaryCards;
