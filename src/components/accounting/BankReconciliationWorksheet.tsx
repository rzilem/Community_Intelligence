import React, { useState, useEffect } from 'react';
import { BankReconciliationService } from '@/services/accounting/bank-reconciliation-service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, X, Save, Send } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';

interface BankReconciliationWorksheetProps {
  selectedAccount: string;
  reconciliation?: any;
}

const BankReconciliationWorksheet: React.FC<BankReconciliationWorksheetProps> = ({
  selectedAccount,
  reconciliation
}) => {
  const [balances, setBalances] = useState({
    statementBalance: reconciliation?.statement_balance || 0,
    bookBalance: reconciliation?.reconciled_balance || 0
  });

  // Mock transaction data
  const bankTransactions = [
    {
      id: '1',
      date: '2024-12-30',
      description: 'Assessment Payment - Unit 101',
      amount: 1250.00,
      cleared: false,
      matched: false
    },
    {
      id: '2',
      date: '2024-12-29',
      description: 'Landscaping Service',
      amount: -850.00,
      cleared: true,
      matched: true
    },
    {
      id: '3',
      date: '2024-12-28',
      description: 'Bank Fee',
      amount: -25.00,
      cleared: true,
      matched: false
    }
  ];

  const bookTransactions = [
    {
      id: '1',
      date: '2024-12-30',
      description: 'Monthly Assessment Receivable',
      amount: 15000.00,
      cleared: false,
      matched: false
    },
    {
      id: '2',
      date: '2024-12-29',
      description: 'Landscaping Vendor Payment',
      amount: -850.00,
      cleared: true,
      matched: true
    },
    {
      id: '3',
      date: '2024-12-27',
      description: 'Outstanding Check #1025',
      amount: -420.00,
      cleared: false,
      matched: false
    }
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(Math.abs(amount));
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const calculateDifference = () => {
    return balances.statementBalance - balances.bookBalance;
  };

  const handleSave = async () => {
    if (!reconciliation?.id) return;
    try {
      await BankReconciliationService.updateReconciliation(reconciliation.id, {
        statement_balance: balances.statementBalance,
        reconciled_balance: balances.bookBalance,
        difference: calculateDifference()
      });
    } catch (error) {
      console.error('Error saving reconciliation:', error);
    }
  };

  const handleComplete = async () => {
    if (!reconciliation?.id || calculateDifference() !== 0) return;
    try {
      await BankReconciliationService.updateReconciliation(reconciliation.id, {
        status: 'completed',
        reconciled_at: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error completing reconciliation:', error);
    }
  };

  if (!selectedAccount) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Please select a bank account to start reconciliation.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Balance Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Statement Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(balances.statementBalance)}</div>
            <Input
              type="number"
              step="0.01"
              value={balances.statementBalance}
              onChange={(e) => setBalances({...balances, statementBalance: parseFloat(e.target.value) || 0})}
              className="mt-2"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Book Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(balances.bookBalance)}</div>
            <div className="text-sm text-muted-foreground mt-2">Auto-calculated</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Difference</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${calculateDifference() === 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(calculateDifference())}
            </div>
            <div className="text-sm text-muted-foreground mt-2">
              {calculateDifference() === 0 ? 'Balanced' : 'Out of balance'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Status</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant={calculateDifference() === 0 ? "default" : "destructive"}>
              {calculateDifference() === 0 ? "Reconciled" : "In Progress"}
            </Badge>
            <div className="flex gap-2 mt-2">
              <Button size="sm" onClick={handleSave}>
                <Save className="h-3 w-3 mr-1" />
                Save
              </Button>
              {calculateDifference() === 0 && (
                <Button size="sm" onClick={handleComplete}>
                  <Send className="h-3 w-3 mr-1" />
                  Complete
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bank Statement Transactions */}
        <Card>
          <CardHeader>
            <CardTitle>Bank Statement Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">Clear</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bankTransactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>
                      <Checkbox checked={transaction.cleared} />
                    </TableCell>
                    <TableCell>{formatDate(transaction.date)}</TableCell>
                    <TableCell className="max-w-48 truncate">
                      {transaction.description}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      <span className={transaction.amount < 0 ? 'text-red-600' : 'text-green-600'}>
                        {transaction.amount < 0 ? '-' : ''}
                        {formatCurrency(transaction.amount)}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Book Transactions */}
        <Card>
          <CardHeader>
            <CardTitle>Book Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">Match</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookTransactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>
                      <Checkbox checked={transaction.matched} />
                    </TableCell>
                    <TableCell>{formatDate(transaction.date)}</TableCell>
                    <TableCell className="max-w-48 truncate">
                      {transaction.description}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      <span className={transaction.amount < 0 ? 'text-red-600' : 'text-green-600'}>
                        {transaction.amount < 0 ? '-' : ''}
                        {formatCurrency(transaction.amount)}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BankReconciliationWorksheet;