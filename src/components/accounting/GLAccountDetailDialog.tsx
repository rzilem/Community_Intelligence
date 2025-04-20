
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { LoadingState } from '@/components/ui/loading-state';
import { GLAccount, JournalEntry } from '@/types/accounting-types';
import { formatDistanceToNow } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ArrowDown, ArrowUp, BarChart, FileText, DollarSign } from 'lucide-react';

interface GLAccountDetailDialogProps {
  isOpen: boolean;
  onClose: () => void;
  account: GLAccount | null;
}

interface AccountTransaction {
  id: string;
  date: string;
  description: string;
  reference: string;
  debit: number;
  credit: number;
  balance: number;
}

// For demo purposes - in a real application, this would come from a database query
const generateMockTransactions = (account: GLAccount): AccountTransaction[] => {
  // Generate 10 random transactions
  return Array.from({ length: 10 }).map((_, index) => {
    const isDebit = Math.random() > 0.5;
    const amount = Math.floor(Math.random() * 1000) + 100;
    
    return {
      id: `tx-${account.id}-${index}`,
      date: new Date(Date.now() - (index * 24 * 60 * 60 * 1000)).toISOString().split('T')[0],
      description: isDebit 
        ? `Payment for ${['Services', 'Maintenance', 'Supplies', 'Utilities'][Math.floor(Math.random() * 4)]}`
        : `Deposit from ${['Assessment', 'Fee', 'Reserve', 'Special Assessment'][Math.floor(Math.random() * 4)]}`,
      reference: `REF-${2025}-${1000 + index}`,
      debit: isDebit ? amount : 0,
      credit: !isDebit ? amount : 0,
      balance: account.balance - (index * (isDebit ? -100 : 100))
    };
  });
};

const GLAccountDetailDialog: React.FC<GLAccountDetailDialogProps> = ({
  isOpen,
  onClose,
  account
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(false);
  const [transactions, setTransactions] = useState<AccountTransaction[]>([]);
  
  useEffect(() => {
    if (isOpen && account) {
      setIsLoading(true);
      // In a real application, we'd fetch transactions from the database
      // For this demo, we'll generate mock data
      setTimeout(() => {
        setTransactions(generateMockTransactions(account));
        setIsLoading(false);
      }, 500);
    }
  }, [isOpen, account]);
  
  if (!account) return null;
  
  const totalDebits = transactions.reduce((sum, tx) => sum + tx.debit, 0);
  const totalCredits = transactions.reduce((sum, tx) => sum + tx.credit, 0);
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            <span className="font-mono text-sm bg-muted px-2 py-1 rounded">
              {account.code}
            </span>
            {account.name}
          </DialogTitle>
          <DialogDescription>
            {account.description || `${account.type} account`}
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="overview">
              <BarChart className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="transactions">
              <FileText className="h-4 w-4 mr-2" />
              Transactions
            </TabsTrigger>
            <TabsTrigger value="reconciliation">
              <DollarSign className="h-4 w-4 mr-2" />
              Reconciliation
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Account Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <dl className="space-y-2">
                    <div className="flex justify-between">
                      <dt className="font-medium">Type:</dt>
                      <dd>{account.type}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="font-medium">Category:</dt>
                      <dd>{account.category || 'Uncategorized'}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="font-medium">Current Balance:</dt>
                      <dd className="font-mono font-bold">${account.balance.toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                      })}</dd>
                    </div>
                  </dl>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Activity Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <ArrowDown className="h-5 w-5 mr-2 text-red-500" />
                        <span>Total Debits</span>
                      </div>
                      <span className="font-mono text-red-500">
                        ${totalDebits.toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2
                        })}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <ArrowUp className="h-5 w-5 mr-2 text-green-500" />
                        <span>Total Credits</span>
                      </div>
                      <span className="font-mono text-green-500">
                        ${totalCredits.toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2
                        })}
                      </span>
                    </div>
                    
                    <div className="border-t pt-2 flex justify-between items-center">
                      <span className="font-medium">Net Change</span>
                      <span className={`font-mono font-bold ${totalCredits - totalDebits > 0 ? 'text-green-500' : 'text-red-500'}`}>
                        ${(totalCredits - totalDebits).toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2
                        })}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="transactions" className="mt-4">
            {isLoading ? (
              <LoadingState variant="spinner" text="Loading transactions..." className="py-10" />
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Reference</TableHead>
                      <TableHead className="text-right">Debit</TableHead>
                      <TableHead className="text-right">Credit</TableHead>
                      <TableHead className="text-right">Balance</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell>{transaction.date}</TableCell>
                        <TableCell>{transaction.description}</TableCell>
                        <TableCell>{transaction.reference}</TableCell>
                        <TableCell className="text-right font-mono text-red-500">
                          {transaction.debit > 0 ? `$${transaction.debit.toFixed(2)}` : ''}
                        </TableCell>
                        <TableCell className="text-right font-mono text-green-500">
                          {transaction.credit > 0 ? `$${transaction.credit.toFixed(2)}` : ''}
                        </TableCell>
                        <TableCell className="text-right font-mono font-bold">
                          ${transaction.balance.toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                    {transactions.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          No transactions found for this account
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="reconciliation" className="mt-4">
            <Card>
              <CardContent className="pt-6">
                <p className="text-muted-foreground mb-4">
                  Reconcile this account with bank statements to ensure all transactions are accurately recorded.
                </p>
                
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="font-medium">System Balance</span>
                    <span className="font-mono font-bold">${account.balance.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="font-medium">Last Reconciled</span>
                    <span className="text-muted-foreground">Never</span>
                  </div>
                  
                  <Button className="w-full">
                    Start Reconciliation
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default GLAccountDetailDialog;
