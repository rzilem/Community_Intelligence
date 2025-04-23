import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  convertToCamelCase, 
  convertToSnakeCase,
  formatBudgetForAPI,
  formatBudgetEntryForAPI
} from './BudgetPlannerPatch';
import { Budget, BudgetEntry, GLAccount } from '@/types/accounting-types';
import { useToast } from '@/components/ui/use-toast';

interface BudgetPlannerProps {
  associationId: string;
  existingBudget?: Budget;
  accounts: GLAccount[];
  onSave: (budget: Budget) => void;
  onCancel: () => void;
}

const BudgetPlanner: React.FC<BudgetPlannerProps> = ({
  associationId,
  existingBudget,
  accounts,
  onSave,
  onCancel
}) => {
  const initialBudget: Partial<Budget> = existingBudget || {
    associationId,
    name: '',
    year: new Date().getFullYear().toString(),
    status: 'draft',
    fundType: 'operating',
    description: ''
  };

  const [budget, setBudget] = useState<Partial<Budget>>(initialBudget);
  const [revenueEntries, setRevenueEntries] = useState<Partial<BudgetEntry>[]>([]);
  const [expenseEntries, setExpenseEntries] = useState<Partial<BudgetEntry>[]>([]);
  
  useEffect(() => {
    if (existingBudget && existingBudget.entries) {
      const entries = existingBudget.entries.map(entry => convertToCamelCase(entry));
      
      const revAccounts = accounts.filter(a => a.type === 'Revenue' || a.type === 'Income').map(a => a.id);
      const expAccounts = accounts.filter(a => a.type === 'Expense').map(a => a.id);
      
      setRevenueEntries(
        entries.filter(entry => revAccounts.includes(entry.glAccountId))
      );
      
      setExpenseEntries(
        entries.filter(entry => expAccounts.includes(entry.glAccountId))
      );
    } else {
      const revAccounts = accounts.filter(a => a.type === 'Revenue' || a.type === 'Income');
      const newRevEntries = revAccounts.map(account => ({
        glAccountId: account.id,
        annualTotal: 0,
        monthlyAmounts: Array(12).fill({ month: 0, amount: 0 })
      }));
      setRevenueEntries(newRevEntries);
      
      const expAccounts = accounts.filter(a => a.type === 'Expense');
      const newExpEntries = expAccounts.map(account => ({
        glAccountId: account.id,
        annualTotal: 0,
        monthlyAmounts: Array(12).fill({ month: 0, amount: 0 })
      }));
      setExpenseEntries(newExpEntries);
    }
  }, [existingBudget, accounts]);
  
  useEffect(() => {
    const totalRevenue = revenueEntries.reduce(
      (sum, entry) => sum + (entry.annualTotal || 0),
      0
    );
    
    const totalExpenses = expenseEntries.reduce(
      (sum, entry) => sum + (entry.annualTotal || 0),
      0
    );
    
    setBudget({
      ...budget,
      totalRevenue,
      totalExpenses
    });
  }, [revenueEntries, expenseEntries]);
  
  const handleRevenueMonthlyChange = (accountId: string, month: number, amount: number) => {
    setRevenueEntries(prev => 
      prev.map(entry => {
        if (entry.glAccountId === accountId) {
          const updatedMonthlyAmounts = [...(entry.monthlyAmounts || [])];
          updatedMonthlyAmounts[month - 1] = { month, amount };
          
          const annualTotal = updatedMonthlyAmounts.reduce(
            (sum, item) => sum + (Number(item.amount) || 0), 
            0
          );
          
          return {
            ...entry,
            monthlyAmounts: updatedMonthlyAmounts,
            annualTotal
          };
        }
        return entry;
      })
    );
  };
  
  const handleExpenseMonthlyChange = (accountId: string, month: number, amount: number) => {
    setExpenseEntries(prev => 
      prev.map(entry => {
        if (entry.glAccountId === accountId) {
          const updatedMonthlyAmounts = [...(entry.monthlyAmounts || [])];
          updatedMonthlyAmounts[month - 1] = { month, amount };
          
          const annualTotal = updatedMonthlyAmounts.reduce(
            (sum, item) => sum + (Number(item.amount) || 0), 
            0
          );
          
          return {
            ...entry,
            monthlyAmounts: updatedMonthlyAmounts,
            annualTotal
          };
        }
        return entry;
      })
    );
  };
  
  const handleRevenueAnnualChange = (accountId: string, amount: number) => {
    setRevenueEntries(prev => 
      prev.map(entry => {
        if (entry.glAccountId === accountId) {
          const monthlyAmount = amount / 12;
          const updatedMonthlyAmounts = Array(12).fill(0).map((_, idx) => ({
            month: idx + 1,
            amount: monthlyAmount
          }));
          
          return {
            ...entry,
            annualTotal: amount,
            monthlyAmounts: updatedMonthlyAmounts
          };
        }
        return entry;
      })
    );
  };
  
  const handleExpenseAnnualChange = (accountId: string, amount: number) => {
    setExpenseEntries(prev => 
      prev.map(entry => {
        if (entry.glAccountId === accountId) {
          const monthlyAmount = amount / 12;
          const updatedMonthlyAmounts = Array(12).fill(0).map((_, idx) => ({
            month: idx + 1,
            amount: monthlyAmount
          }));
          
          return {
            ...entry,
            annualTotal: amount,
            monthlyAmounts: updatedMonthlyAmounts
          };
        }
        return entry;
      })
    );
  };
  
  const handleBudgetChange = (field: keyof Budget, value: string) => {
    setBudget(prev => ({ ...prev, [field]: value }));
  };
  
  const handleSave = () => {
    try {
      const allEntries = [...revenueEntries, ...expenseEntries];
      
      const completeBudget: Budget = {
        ...budget as Budget,
        entries: allEntries as BudgetEntry[],
      };
      
      console.log('Saving budget:', completeBudget);
      onSave(completeBudget);
    } catch (error) {
      console.error('Error saving budget:', error);
    }
  };
  
  const getAccount = (id: string) => {
    return accounts.find(a => a.id === id);
  };
  
  const renderMonthlyFields = (entry: Partial<BudgetEntry>, isRevenue: boolean) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    return months.map((month, idx) => {
      const monthNumber = idx + 1;
      const monthlyValues = entry.monthlyAmounts || [];
      const monthValue = monthlyValues[idx]?.amount || 0;
      
      const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = Number(e.target.value) || 0;
        if (isRevenue) {
          handleRevenueMonthlyChange(entry.glAccountId!, monthNumber, value);
        } else {
          handleExpenseMonthlyChange(entry.glAccountId!, monthNumber, value);
        }
      };
      
      return (
        <div key={`${entry.glAccountId}-${month}`} className="flex flex-col">
          <label className="text-xs text-gray-500">{month}</label>
          <input
            type="number"
            value={monthValue}
            onChange={handleChange}
            className="border rounded px-2 py-1 text-sm"
          />
        </div>
      );
    });
  };
  
  const renderRevenueAccounts = () => {
    return revenueEntries.map(entry => {
      const account = getAccount(entry.glAccountId!);
      
      if (!account) return null;
      
      return (
        <div key={entry.glAccountId} className="border-b py-2">
          <div className="flex justify-between items-center mb-2">
            <div className="font-medium">{account.code} - {account.name}</div>
            <input
              type="number"
              value={entry.annualTotal || 0}
              onChange={(e) => handleRevenueAnnualChange(entry.glAccountId!, Number(e.target.value) || 0)}
              className="border rounded px-3 py-1 w-32 font-bold text-green-600"
            />
          </div>
          <div className="grid grid-cols-12 gap-1">
            {renderMonthlyFields(entry, true)}
          </div>
        </div>
      );
    });
  };
  
  const renderExpenseAccounts = () => {
    return expenseEntries.map(entry => {
      const account = getAccount(entry.glAccountId!);
      
      if (!account) return null;
      
      return (
        <div key={entry.glAccountId} className="border-b py-2">
          <div className="flex justify-between items-center mb-2">
            <div className="font-medium">{account.code} - {account.name}</div>
            <input
              type="number"
              value={entry.annualTotal || 0}
              onChange={(e) => handleExpenseAnnualChange(entry.glAccountId!, Number(e.target.value) || 0)}
              className="border rounded px-3 py-1 w-32 font-bold text-red-600"
            />
          </div>
          <div className="grid grid-cols-12 gap-1">
            {renderMonthlyFields(entry, false)}
          </div>
        </div>
      );
    });
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Budget Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Budget Name</label>
              <input 
                type="text"
                value={budget.name || ''}
                onChange={(e) => handleBudgetChange('name', e.target.value)}
                className="border rounded w-full px-3 py-2"
                placeholder="e.g., 2025 Operating Budget"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Year</label>
              <input 
                type="text"
                value={budget.year || ''}
                onChange={(e) => handleBudgetChange('year', e.target.value)}
                className="border rounded w-full px-3 py-2"
                placeholder="e.g., 2025"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Fund Type</label>
              <select 
                value={budget.fundType || 'operating'}
                onChange={(e) => handleBudgetChange('fundType', e.target.value)}
                className="border rounded w-full px-3 py-2"
              >
                <option value="operating">Operating</option>
                <option value="reserve">Reserve</option>
                <option value="capital">Capital</option>
              </select>
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea 
              value={budget.description || ''}
              onChange={(e) => handleBudgetChange('description', e.target.value)}
              className="border rounded w-full px-3 py-2"
              rows={2}
              placeholder="Optional budget description..."
            />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Revenue</CardTitle>
        </CardHeader>
        <CardContent>
          {renderRevenueAccounts()}
          <div className="mt-4 text-right font-bold">
            <span className="mr-4">Total Revenue:</span> 
            ${(budget.totalRevenue || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          {renderExpenseAccounts()}
          <div className="mt-4 text-right font-bold">
            <span className="mr-4">Total Expenses:</span> 
            ${(budget.totalExpenses || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="py-4">
          <div className="flex justify-between">
            <div>
              <div className="text-lg font-medium">Net Income:</div>
              <div className={`text-2xl font-bold ${
                ((budget.totalRevenue || 0) - (budget.totalExpenses || 0)) >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                ${((budget.totalRevenue || 0) - (budget.totalExpenses || 0)).toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
            </div>
            <div className="space-x-2">
              <Button variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button onClick={handleSave}>
                Save Budget
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BudgetPlanner;
