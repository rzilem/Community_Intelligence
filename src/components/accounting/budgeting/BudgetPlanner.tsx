
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LoadingState } from '@/components/ui/loading-state';
import { useGLAccounts } from '@/hooks/accounting/useGLAccounts';
import { useBudgets } from '@/hooks/accounting/useBudgets';
import { Budget, BudgetEntry } from '@/types/accounting-types';
import { ArrowRight, Plus, Save } from 'lucide-react';
import { toast } from 'sonner';

interface BudgetPlannerProps {
  associationId: string;
  budget?: Budget;
  onSave?: (budget: Budget) => void;
}

export const BudgetPlanner: React.FC<BudgetPlannerProps> = ({
  associationId,
  budget,
  onSave
}) => {
  const { accounts, isLoading: isLoadingAccounts } = useGLAccounts({
    associationId,
    includeMaster: true
  });
  
  const [budgetData, setBudgetData] = useState<Partial<Budget>>(budget || {
    association_id: associationId,
    name: `Budget ${new Date().getFullYear() + 1}`,
    year: `${new Date().getFullYear() + 1}`,
    status: 'draft',
    fund_type: 'operating',
    description: '',
  });
  
  const [entries, setEntries] = useState<Partial<BudgetEntry>[]>(
    budget?.entries || []
  );
  
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const revenueAccounts = accounts.filter(account => account.type === 'Revenue');
  const expenseAccounts = accounts.filter(account => account.type === 'Expense');

  const handleAddEntry = () => {
    if (!selectedAccountId) {
      toast.error('Please select an account');
      return;
    }

    const existingEntry = entries.find(entry => entry.gl_account_id === selectedAccountId);
    if (existingEntry) {
      toast.error('This account is already in the budget');
      return;
    }

    const account = accounts.find(acc => acc.id === selectedAccountId);
    setEntries([...entries, {
      gl_account_id: selectedAccountId,
      annual_total: 0,
      monthly_amounts: Array(12).fill({ amount: 0 })
    }]);
    setSelectedAccountId('');
  };

  const handleEntryAmountChange = (index: number, value: string) => {
    const newEntries = [...entries];
    const amount = parseFloat(value) || 0;
    newEntries[index].annual_total = amount;
    
    // Distribute evenly across months
    const monthlyAmount = amount / 12;
    newEntries[index].monthly_amounts = Array(12).fill({ amount: monthlyAmount });
    
    setEntries(newEntries);
  };

  const handleRemoveEntry = (index: number) => {
    const newEntries = [...entries];
    newEntries.splice(index, 1);
    setEntries(newEntries);
  };

  const handleSaveBudget = () => {
    if (!budgetData.name || !budgetData.year) {
      toast.error('Please provide a name and year for the budget');
      return;
    }

    setIsSubmitting(true);

    const totalRevenue = entries
      .filter(entry => {
        const account = accounts.find(acc => acc.id === entry.gl_account_id);
        return account?.type === 'Revenue';
      })
      .reduce((sum, entry) => sum + (entry.annual_total || 0), 0);

    const totalExpenses = entries
      .filter(entry => {
        const account = accounts.find(acc => acc.id === entry.gl_account_id);
        return account?.type === 'Expense';
      })
      .reduce((sum, entry) => sum + (entry.annual_total || 0), 0);

    const completeBudget: Budget = {
      ...(budgetData as Budget),
      total_revenue: totalRevenue,
      total_expenses: totalExpenses,
      entries: entries as BudgetEntry[]
    };

    if (onSave) {
      onSave(completeBudget);
    }

    setIsSubmitting(false);
  };

  if (isLoadingAccounts) {
    return <LoadingState variant="spinner" text="Loading accounts..." className="py-10" />;
  }

  const totalRevenue = entries
    .filter(entry => {
      const account = accounts.find(acc => acc.id === entry.gl_account_id);
      return account?.type === 'Revenue';
    })
    .reduce((sum, entry) => sum + (entry.annual_total || 0), 0);

  const totalExpenses = entries
    .filter(entry => {
      const account = accounts.find(acc => acc.id === entry.gl_account_id);
      return account?.type === 'Expense';
    })
    .reduce((sum, entry) => sum + (entry.annual_total || 0), 0);

  const netIncome = totalRevenue - totalExpenses;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Budget Information</CardTitle>
          <CardDescription>Enter basic information for this budget</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Budget Name</label>
              <Input
                value={budgetData.name || ''}
                onChange={(e) => setBudgetData({ ...budgetData, name: e.target.value })}
                placeholder="Annual Budget 2025"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Year</label>
              <Input
                value={budgetData.year || ''}
                onChange={(e) => setBudgetData({ ...budgetData, year: e.target.value })}
                placeholder="2025"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Fund Type</label>
              <Select
                value={budgetData.fund_type || 'operating'}
                onValueChange={(value) => setBudgetData({ ...budgetData, fund_type: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select fund type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="operating">Operating</SelectItem>
                  <SelectItem value="reserve">Reserve</SelectItem>
                  <SelectItem value="capital">Capital</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-3">
              <label className="block text-sm font-medium mb-1">Description</label>
              <Input
                value={budgetData.description || ''}
                onChange={(e) => setBudgetData({ ...budgetData, description: e.target.value })}
                placeholder="Annual budget for the fiscal year"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Budget Entries</CardTitle>
          <CardDescription>Add and configure budget entries by account</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6 items-end">
            <div className="flex-grow">
              <label className="block text-sm font-medium mb-1">Add Account</label>
              <Select value={selectedAccountId} onValueChange={setSelectedAccountId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select an account" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="" disabled>Select an account</SelectItem>
                  {revenueAccounts.length > 0 && (
                    <SelectItem value="revenue-header" disabled>-- Revenue Accounts --</SelectItem>
                  )}
                  {revenueAccounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.code} - {account.name}
                    </SelectItem>
                  ))}
                  {expenseAccounts.length > 0 && (
                    <SelectItem value="expense-header" disabled>-- Expense Accounts --</SelectItem>
                  )}
                  {expenseAccounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.code} - {account.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleAddEntry}>
              <Plus className="h-4 w-4 mr-1" />
              Add Entry
            </Button>
          </div>

          {entries.length === 0 ? (
            <div className="text-center py-8 border rounded-md bg-muted/20">
              <p className="text-muted-foreground">No budget entries added yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                Select an account above to add your first budget entry
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Revenue Entries */}
              <div>
                <h3 className="text-lg font-medium mb-3">Revenue</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Account</TableHead>
                      <TableHead className="text-right">Annual Amount</TableHead>
                      <TableHead className="w-24">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {entries
                      .filter(entry => {
                        const account = accounts.find(acc => acc.id === entry.gl_account_id);
                        return account?.type === 'Revenue';
                      })
                      .map((entry, index) => {
                        const account = accounts.find(acc => acc.id === entry.gl_account_id);
                        return (
                          <TableRow key={index}>
                            <TableCell>{account ? `${account.code} - ${account.name}` : 'Unknown Account'}</TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                value={entry.annual_total || ''}
                                onChange={(e) => handleEntryAmountChange(
                                  entries.findIndex(e => e.gl_account_id === entry.gl_account_id),
                                  e.target.value
                                )}
                                className="text-right w-40 ml-auto"
                              />
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveEntry(
                                  entries.findIndex(e => e.gl_account_id === entry.gl_account_id)
                                )}
                              >
                                Remove
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    <TableRow>
                      <TableCell className="font-bold">Total Revenue</TableCell>
                      <TableCell className="text-right font-bold">${totalRevenue.toFixed(2)}</TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>

              {/* Expense Entries */}
              <div>
                <h3 className="text-lg font-medium mb-3">Expenses</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Account</TableHead>
                      <TableHead className="text-right">Annual Amount</TableHead>
                      <TableHead className="w-24">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {entries
                      .filter(entry => {
                        const account = accounts.find(acc => acc.id === entry.gl_account_id);
                        return account?.type === 'Expense';
                      })
                      .map((entry, index) => {
                        const account = accounts.find(acc => acc.id === entry.gl_account_id);
                        return (
                          <TableRow key={index}>
                            <TableCell>{account ? `${account.code} - ${account.name}` : 'Unknown Account'}</TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                value={entry.annual_total || ''}
                                onChange={(e) => handleEntryAmountChange(
                                  entries.findIndex(e => e.gl_account_id === entry.gl_account_id),
                                  e.target.value
                                )}
                                className="text-right w-40 ml-auto"
                              />
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveEntry(
                                  entries.findIndex(e => e.gl_account_id === entry.gl_account_id)
                                )}
                              >
                                Remove
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    <TableRow>
                      <TableCell className="font-bold">Total Expenses</TableCell>
                      <TableCell className="text-right font-bold">${totalExpenses.toFixed(2)}</TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>

              {/* Budget Summary */}
              <div className="pt-4 border-t">
                <div className="flex justify-between items-center">
                  <div className="text-lg font-bold">Net Income</div>
                  <div className={`text-lg font-bold ${netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ${netIncome.toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end mt-6">
            <Button onClick={handleSaveBudget} disabled={isSubmitting}>
              <Save className="h-4 w-4 mr-1" />
              {isSubmitting ? 'Saving...' : 'Save Budget'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
