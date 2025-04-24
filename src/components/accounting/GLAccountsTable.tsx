
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { GLAccount } from '@/types/accounting-types';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface GLAccountsTableProps {
  accounts: GLAccount[];
  searchTerm?: string;
  accountType?: string;
  onSearchChange?: (value: string) => void;
  onAccountTypeChange?: (value: string) => void;
  onAccountAdded?: (account: GLAccount) => void;
}

export const GLAccountsTable = ({ 
  accounts, 
  searchTerm = '', 
  accountType = 'all',
  onSearchChange, 
  onAccountTypeChange,
  onAccountAdded
}: GLAccountsTableProps) => {
  // Filter accounts based on search term and account type
  const filteredAccounts = accounts
    .filter(account => account.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                      account.code.toLowerCase().includes(searchTerm.toLowerCase()))
    .filter(account => accountType === 'all' || account.type === accountType);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle>GL Accounts</CardTitle>
        {onAccountAdded && (
          <Button size="sm" onClick={() => onAccountAdded({} as GLAccount)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Account
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-4">
          <div className="flex flex-row space-x-4">
            {/* Search input */}
            {onSearchChange && (
              <div className="flex-1">
                <Input
                  placeholder="Search accounts..."
                  value={searchTerm}
                  onChange={(e) => onSearchChange(e.target.value)}
                />
              </div>
            )}
            
            {/* Account type filter */}
            {onAccountTypeChange && (
              <div className="w-[180px]">
                <Select value={accountType} onValueChange={onAccountTypeChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="asset">Asset</SelectItem>
                    <SelectItem value="liability">Liability</SelectItem>
                    <SelectItem value="equity">Equity</SelectItem>
                    <SelectItem value="revenue">Revenue</SelectItem>
                    <SelectItem value="expense">Expense</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="w-[100px]">Code</TableHead>
                  <TableHead>Account Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Balance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAccounts.length > 0 ? (
                  filteredAccounts.map((account) => (
                    <TableRow key={account.id}>
                      <TableCell className="font-mono">{account.code}</TableCell>
                      <TableCell className="font-medium">{account.name}</TableCell>
                      <TableCell>{account.type}</TableCell>
                      <TableCell className="text-right">
                        ${account.balance?.toLocaleString() || '0.00'}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                      No accounts found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
