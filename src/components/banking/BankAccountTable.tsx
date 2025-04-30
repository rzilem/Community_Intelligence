
import React, { useState } from 'react';
import { Edit, Trash2, ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import ColumnSelector from '@/components/table/ColumnSelector';

export type BankAccount = {
  id: string;
  name: string;
  accountNumber: string;
  routingNumber: string;
  balance: number;
  accountType: string;
  institution: string;
  lastReconciled: string;
};

type ColumnKey = 'name' | 'accountNumber' | 'routingNumber' | 'balance' | 'accountType' | 'institution' | 'lastReconciled';

interface BankAccountTableProps {
  accounts: BankAccount[];
  searchTerm?: string;
}

const BankAccountTable: React.FC<BankAccountTableProps> = ({
  accounts,
  searchTerm = ''
}) => {
  const [visibleColumns, setVisibleColumns] = useState<ColumnKey[]>([
    'name', 'accountNumber', 'balance', 'accountType', 'institution', 'lastReconciled'
  ]);

  const columnOptions = [
    { id: 'name', label: 'Account Name' },
    { id: 'accountNumber', label: 'Account Number' },
    { id: 'routingNumber', label: 'Routing Number' },
    { id: 'balance', label: 'Current Balance' },
    { id: 'accountType', label: 'Account Type' },
    { id: 'institution', label: 'Financial Institution' },
    { id: 'lastReconciled', label: 'Last Reconciled' }
  ];

  const handleColumnChange = (selectedColumns: string[]) => {
    setVisibleColumns(selectedColumns as ColumnKey[]);
  };

  const filteredAccounts = accounts.filter(account => {
    return account.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           account.accountNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
           account.institution.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD' 
    }).format(amount);
  };

  return (
    <div>
      <div className="flex justify-end mb-4">
        <ColumnSelector
          columns={columnOptions}
          selectedColumns={visibleColumns}
          onChange={handleColumnChange}
        />
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {visibleColumns.includes('name') && (
                <TableHead className="w-[200px]">
                  <div className="flex items-center">
                    Account Name
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </div>
                </TableHead>
              )}
              {visibleColumns.includes('accountNumber') && (
                <TableHead>
                  <div className="flex items-center">
                    Account Number
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </div>
                </TableHead>
              )}
              {visibleColumns.includes('routingNumber') && (
                <TableHead>
                  <div className="flex items-center">
                    Routing Number
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </div>
                </TableHead>
              )}
              {visibleColumns.includes('balance') && (
                <TableHead>
                  <div className="flex items-center">
                    Current Balance
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </div>
                </TableHead>
              )}
              {visibleColumns.includes('accountType') && (
                <TableHead>
                  <div className="flex items-center">
                    Account Type
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </div>
                </TableHead>
              )}
              {visibleColumns.includes('institution') && (
                <TableHead>
                  <div className="flex items-center">
                    Financial Institution
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </div>
                </TableHead>
              )}
              {visibleColumns.includes('lastReconciled') && (
                <TableHead>
                  <div className="flex items-center">
                    Last Reconciled
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </div>
                </TableHead>
              )}
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAccounts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={visibleColumns.length + 1} className="text-center py-6 text-muted-foreground">
                  No bank accounts found matching your search.
                </TableCell>
              </TableRow>
            ) : (
              filteredAccounts.map((account) => (
                <TableRow key={account.id}>
                  {visibleColumns.includes('name') && (
                    <TableCell className="font-medium">{account.name}</TableCell>
                  )}
                  {visibleColumns.includes('accountNumber') && (
                    <TableCell>
                      {account.accountNumber.replace(/^(\d{2})(\d{2})(\d{4})$/, "••••••••$3")}
                    </TableCell>
                  )}
                  {visibleColumns.includes('routingNumber') && (
                    <TableCell>{account.routingNumber}</TableCell>
                  )}
                  {visibleColumns.includes('balance') && (
                    <TableCell>{formatCurrency(account.balance)}</TableCell>
                  )}
                  {visibleColumns.includes('accountType') && (
                    <TableCell>{account.accountType}</TableCell>
                  )}
                  {visibleColumns.includes('institution') && (
                    <TableCell>{account.institution}</TableCell>
                  )}
                  {visibleColumns.includes('lastReconciled') && (
                    <TableCell>{account.lastReconciled}</TableCell>
                  )}
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4 mr-1" /> Edit
                      </Button>
                      <Button variant="ghost" size="sm" className="text-destructive">
                        <Trash2 className="h-4 w-4 mr-1" /> Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default BankAccountTable;
