import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface GLAccount {
  id: string;
  account_code: string;
  account_name: string;
  account_type: string;
  account_subtype: string;
  current_balance: number;
  is_active: boolean;
  parent_account_id?: string;
}

interface GLAccountsTableProps {
  searchTerm: string;
  accountType: string;
}

const GLAccountsTable: React.FC<GLAccountsTableProps> = ({
  searchTerm,
  accountType
}) => {
  // Mock data - in real app this would come from API
  const accounts: GLAccount[] = [
    {
      id: '1',
      account_code: '1000',
      account_name: 'Cash - Operating',
      account_type: 'asset',
      account_subtype: 'current_asset',
      current_balance: 125430.25,
      is_active: true
    },
    {
      id: '2',
      account_code: '1100',
      account_name: 'Accounts Receivable',
      account_type: 'asset',
      account_subtype: 'current_asset',
      current_balance: 45672.80,
      is_active: true
    },
    {
      id: '3',
      account_code: '2000',
      account_name: 'Accounts Payable',
      account_type: 'liability',
      account_subtype: 'current_liability',
      current_balance: -18945.50,
      is_active: true
    },
    {
      id: '4',
      account_code: '4000',
      account_name: 'Assessment Income',
      account_type: 'revenue',
      account_subtype: 'assessment_income',
      current_balance: -250000.00,
      is_active: true
    },
    {
      id: '5',
      account_code: '6000',
      account_name: 'Maintenance Expenses',
      account_type: 'expense',
      account_subtype: 'maintenance_expense',
      current_balance: 85420.15,
      is_active: true
    }
  ];

  const filteredAccounts = accounts.filter(account => {
    const matchesSearch = account.account_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         account.account_code.includes(searchTerm);
    const matchesType = accountType === 'all' || account.account_type === accountType;
    return matchesSearch && matchesType;
  });

  const formatBalance = (balance: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(Math.abs(balance));
  };

  const getAccountTypeColor = (type: string) => {
    switch (type) {
      case 'asset': return 'bg-blue-100 text-blue-800';
      case 'liability': return 'bg-red-100 text-red-800';
      case 'equity': return 'bg-purple-100 text-purple-800';
      case 'revenue': return 'bg-green-100 text-green-800';
      case 'expense': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Account Code</TableHead>
            <TableHead>Account Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Subtype</TableHead>
            <TableHead className="text-right">Balance</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredAccounts.map((account) => (
            <TableRow key={account.id}>
              <TableCell className="font-mono">{account.account_code}</TableCell>
              <TableCell className="font-medium">{account.account_name}</TableCell>
              <TableCell>
                <Badge className={getAccountTypeColor(account.account_type)}>
                  {account.account_type.charAt(0).toUpperCase() + account.account_type.slice(1)}
                </Badge>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {account.account_subtype.replace('_', ' ')}
              </TableCell>
              <TableCell className="text-right font-mono">
                <span className={account.current_balance < 0 ? 'text-red-600' : 'text-green-600'}>
                  {formatBalance(account.current_balance)}
                </span>
              </TableCell>
              <TableCell>
                <Badge variant={account.is_active ? 'default' : 'secondary'}>
                  {account.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button variant="ghost" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      {filteredAccounts.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No accounts found matching your criteria.
        </div>
      )}
    </div>
  );
};

export default GLAccountsTable;