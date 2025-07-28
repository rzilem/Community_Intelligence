import React, { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import PageTemplate from '@/components/layout/PageTemplate';
import { FolderTree, Plus, Edit, Trash2, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import TooltipButton from '@/components/ui/tooltip-button';

// Mock data for chart of accounts
const mockAccounts = [
  // Assets
  {
    id: '1',
    code: '1100',
    name: 'Cash - Operating',
    type: 'Asset',
    category: 'Current Assets',
    balance: 45350,
    isActive: true,
    description: 'Primary operating cash account'
  },
  {
    id: '2',
    code: '1200',
    name: 'Cash - Reserve Fund',
    type: 'Asset',
    category: 'Current Assets',
    balance: 125000,
    isActive: true,
    description: 'Reserve fund for major repairs'
  },
  {
    id: '3',
    code: '1300',
    name: 'Accounts Receivable',
    type: 'Asset',
    category: 'Current Assets',
    balance: 2150,
    isActive: true,
    description: 'Outstanding assessments and fees'
  },
  {
    id: '4',
    code: '1500',
    name: 'Prepaid Insurance',
    type: 'Asset',
    category: 'Current Assets',
    balance: 8500,
    isActive: true,
    description: 'Prepaid insurance premiums'
  },
  
  // Liabilities
  {
    id: '5',
    code: '2100',
    name: 'Accounts Payable',
    type: 'Liability',
    category: 'Current Liabilities',
    balance: 3250,
    isActive: true,
    description: 'Outstanding vendor invoices'
  },
  {
    id: '6',
    code: '2200',
    name: 'Accrued Expenses',
    type: 'Liability',
    category: 'Current Liabilities',
    balance: 1500,
    isActive: true,
    description: 'Accrued but unpaid expenses'
  },
  
  // Equity
  {
    id: '7',
    code: '3100',
    name: 'Retained Earnings',
    type: 'Equity',
    category: 'Equity',
    balance: 176250,
    isActive: true,
    description: 'Accumulated earnings'
  },
  
  // Income
  {
    id: '8',
    code: '4100',
    name: 'Assessment Income',
    type: 'Income',
    category: 'Operating Income',
    balance: 24850,
    isActive: true,
    description: 'Monthly and special assessments'
  },
  {
    id: '9',
    code: '4200',
    name: 'Late Fees',
    type: 'Income',
    category: 'Operating Income',
    balance: 750,
    isActive: true,
    description: 'Late payment fees'
  },
  {
    id: '10',
    code: '4300',
    name: 'Interest Income',
    type: 'Income',
    category: 'Other Income',
    balance: 125,
    isActive: true,
    description: 'Interest earned on deposits'
  },
  
  // Expenses
  {
    id: '11',
    code: '6100',
    name: 'Bank Fees',
    type: 'Expense',
    category: 'Administrative',
    balance: 125,
    isActive: true,
    description: 'Banking fees and charges'
  },
  {
    id: '12',
    code: '6200',
    name: 'Landscaping Expense',
    type: 'Expense',
    category: 'Maintenance',
    balance: 8750,
    isActive: true,
    description: 'Landscaping and grounds maintenance'
  },
  {
    id: '13',
    code: '6300',
    name: 'Pool Maintenance',
    type: 'Expense',
    category: 'Maintenance',
    balance: 2800,
    isActive: true,
    description: 'Pool cleaning and maintenance'
  },
  {
    id: '14',
    code: '6400',
    name: 'Insurance Expense',
    type: 'Expense',
    category: 'Administrative',
    balance: 12000,
    isActive: true,
    description: 'Property and liability insurance'
  }
];

const ChartOfAccounts = () => {
  const [accounts] = useState(mockAccounts);
  const [selectedType, setSelectedType] = useState<string>('all');

  const filteredAccounts = accounts.filter(account => 
    selectedType === 'all' || account.type === selectedType
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Asset':
        return 'bg-blue-100 text-blue-800';
      case 'Liability':
        return 'bg-red-100 text-red-800';
      case 'Equity':
        return 'bg-purple-100 text-purple-800';
      case 'Income':
        return 'bg-green-100 text-green-800';
      case 'Expense':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Calculate summary by type
  const accountSummary = accounts.reduce((acc, account) => {
    if (!acc[account.type]) {
      acc[account.type] = { count: 0, balance: 0 };
    }
    acc[account.type].count++;
    acc[account.type].balance += account.balance;
    return acc;
  }, {} as Record<string, { count: number; balance: number }>);

  return (
    <AppLayout>
      <PageTemplate
        title="Chart of Accounts"
        icon={<FolderTree className="h-8 w-8" />}
        description="Manage the financial account structure and hierarchy for your HOA."
        actions={
          <TooltipButton
            tooltip="Add a new account"
            variant="default"
            size="sm"
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            New Account
          </TooltipButton>
        }
      >
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {Object.entries(accountSummary).map(([type, data]) => (
              <Card key={type}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">{type}s</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-lg font-bold">{data.count} accounts</div>
                  <p className="text-sm text-muted-foreground">{formatCurrency(data.balance)}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Account Type Filter */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Filter by type:</span>
            {['all', 'Asset', 'Liability', 'Equity', 'Income', 'Expense'].map(type => (
              <Button
                key={type}
                variant={selectedType === type ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedType(type)}
              >
                {type === 'all' ? 'All' : type}
              </Button>
            ))}
          </div>

          {/* Accounts Table */}
          <Card>
            <CardHeader>
              <CardTitle>Accounts ({filteredAccounts.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Account Code</TableHead>
                    <TableHead>Account Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Balance</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAccounts.map((account) => (
                    <TableRow key={account.id}>
                      <TableCell className="font-mono font-medium">{account.code}</TableCell>
                      <TableCell className="font-medium">{account.name}</TableCell>
                      <TableCell>
                        <Badge className={getTypeColor(account.type)}>
                          {account.type}
                        </Badge>
                      </TableCell>
                      <TableCell>{account.category}</TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(account.balance)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={account.isActive ? 'default' : 'secondary'}>
                          {account.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">{account.description}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <TooltipButton
                            tooltip="View account details"
                            variant="ghost"
                            size="sm"
                          >
                            <Eye className="h-4 w-4" />
                          </TooltipButton>
                          <TooltipButton
                            tooltip="Edit account"
                            variant="ghost"
                            size="sm"
                          >
                            <Edit className="h-4 w-4" />
                          </TooltipButton>
                          <TooltipButton
                            tooltip="Delete account"
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </TooltipButton>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </PageTemplate>
    </AppLayout>
  );
};

export default ChartOfAccounts;