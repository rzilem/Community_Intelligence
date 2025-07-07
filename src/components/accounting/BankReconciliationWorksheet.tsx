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
import { useToast } from '@/hooks/use-toast';

interface BankReconciliationWorksheetProps {
  selectedAccount: string;
  reconciliation?: any;
}

const BankReconciliationWorksheet: React.FC<BankReconciliationWorksheetProps> = ({
  selectedAccount,
  reconciliation
}) => {
  const { toast } = useToast();
  const [balances, setBalances] = useState({
    statementBalance: reconciliation?.statement_balance || 0,
    bookBalance: reconciliation?.reconciled_balance || 0
  });

  const [bankTransactions, setBankTransactions] = useState<any[]>([]);
  const [bookTransactions, setBookTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedAccount && reconciliation?.id) {
      fetchReconciliationData();
    }
  }, [selectedAccount, reconciliation?.id]);

  const fetchReconciliationData = async () => {
    try {
      setLoading(true);
      const items = await BankReconciliationService.getReconciliationItems(reconciliation.id);
      
      // Separate bank and book transactions
      const bankTxns = items.filter(item => item.transaction_type === 'bank_statement');
      const bookTxns = items.filter(item => item.transaction_type === 'book_entry');
      
      setBankTransactions(bankTxns.map(item => ({
        id: item.id,
        date: item.transaction_date,
        description: item.description,
        amount: item.amount,
        cleared: item.status === 'cleared',
        matched: item.status === 'matched'
      })));

      setBookTransactions(bookTxns.map(item => ({
        id: item.id,
        date: item.transaction_date,
        description: item.description,
        amount: item.amount,
        cleared: item.status === 'cleared',
        matched: item.status === 'matched'
      })));
    } catch (error) {
      console.error('Error fetching reconciliation data:', error);
    } finally {
      setLoading(false);
    }
  };

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
      toast({
        title: "Reconciliation Saved",
        description: "Bank reconciliation has been saved successfully."
      });
    } catch (error) {
      console.error('Error saving reconciliation:', error);
      toast({
        title: "Error",
        description: "Failed to save reconciliation. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleComplete = async () => {
    if (!reconciliation?.id || calculateDifference() !== 0) return;
    try {
      await BankReconciliationService.updateReconciliation(reconciliation.id, {
        status: 'completed',
        reconciled_at: new Date().toISOString()
      });
      toast({
        title: "Reconciliation Completed",
        description: "Bank reconciliation has been completed and finalized."
      });
    } catch (error) {
      console.error('Error completing reconciliation:', error);
      toast({
        title: "Error",
        description: "Failed to complete reconciliation. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleTransactionToggle = async (transactionId: string, isCleared: boolean, transactionType: 'bank' | 'book') => {
    try {
      await BankReconciliationService.updateReconciliationItem(transactionId, {
        status: isCleared ? 'cleared' : 'outstanding'
      });
      
      // Update local state
      if (transactionType === 'bank') {
        setBankTransactions(prev => 
          prev.map(txn => 
            txn.id === transactionId ? { ...txn, cleared: isCleared } : txn
          )
        );
      } else {
        setBookTransactions(prev => 
          prev.map(txn => 
            txn.id === transactionId ? { ...txn, matched: isCleared } : txn
          )
        );
      }
    } catch (error) {
      console.error('Error updating transaction:', error);
      toast({
        title: "Error",
        description: "Failed to update transaction status.",
        variant: "destructive"
      });
    }
  };

  if (!selectedAccount) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Please select a bank account to start reconciliation.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Loading reconciliation data...
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
                      <Checkbox 
                        checked={transaction.cleared} 
                        onCheckedChange={(checked) => 
                          handleTransactionToggle(transaction.id, checked as boolean, 'bank')
                        }
                      />
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
                      <Checkbox 
                        checked={transaction.matched} 
                        onCheckedChange={(checked) => 
                          handleTransactionToggle(transaction.id, checked as boolean, 'book')
                        }
                      />
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