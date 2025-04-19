
import React, { useState } from 'react';
import { Edit, Trash2, ArrowUpDown, Upload, Download, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import ColumnSelector from '@/components/table/ColumnSelector';
import BankAccountDialog from './BankAccountDialog';
import BankStatementDialog from './BankStatementDialog';
import { format } from 'date-fns';

export type BankAccount = {
  id: string;
  name: string;
  accountNumber: string;
  routingNumber: string;
  balance: number;
  accountType: string;
  institution: string;
  lastReconciled?: string;
  lastReconciledDate?: string | Date;
  lastStatementDate?: string | Date;
};

type ColumnKey = 'name' | 'accountNumber' | 'routingNumber' | 'balance' | 'accountType' | 'institution' | 'lastReconciled' | 'actions';

interface BankAccountTableProps {
  accounts: BankAccount[];
  searchTerm?: string;
  onUpdateAccount?: (account: BankAccount) => void;
  onDeleteAccount?: (id: string) => void;
}

const BankAccountTable: React.FC<BankAccountTableProps> = ({
  accounts,
  searchTerm = '',
  onUpdateAccount,
  onDeleteAccount
}) => {
  const [visibleColumns, setVisibleColumns] = useState<ColumnKey[]>([
    'name', 'accountNumber', 'balance', 'accountType', 'institution', 'lastReconciled', 'actions'
  ]);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentAccount, setCurrentAccount] = useState<BankAccount | null>(null);
  const [isStatementDialogOpen, setIsStatementDialogOpen] = useState(false);

  const columnOptions = [
    { id: 'name', label: 'Account Name' },
    { id: 'accountNumber', label: 'Account Number' },
    { id: 'routingNumber', label: 'Routing Number' },
    { id: 'balance', label: 'Current Balance' },
    { id: 'accountType', label: 'Account Type' },
    { id: 'institution', label: 'Financial Institution' },
    { id: 'lastReconciled', label: 'Last Reconciled' },
    { id: 'actions', label: 'Actions' }
  ];

  const handleColumnChange = (selectedColumns: string[]) => {
    setVisibleColumns(selectedColumns as ColumnKey[]);
  };

  const handleEdit = (account: BankAccount) => {
    setCurrentAccount(account);
    setIsEditDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (onDeleteAccount) {
      onDeleteAccount(id);
    }
  };

  const handleStatementUpload = (account: BankAccount) => {
    setCurrentAccount(account);
    setIsStatementDialogOpen(true);
  };

  const handleUpdateAccount = (data: Partial<BankAccount>) => {
    if (currentAccount && onUpdateAccount) {
      const updatedAccount = { ...currentAccount, ...data };
      onUpdateAccount(updatedAccount);
    }
    setIsEditDialogOpen(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD' 
    }).format(amount);
  };

  const formatDate = (date: string | Date | undefined) => {
    if (!date) return 'Never';
    try {
      return format(new Date(date), 'MM/dd/yyyy');
    } catch (error) {
      return 'Invalid date';
    }
  };

  const filteredAccounts = accounts.filter(account => {
    return account.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           account.accountNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
           account.institution.toLowerCase().includes(searchTerm.toLowerCase());
  });

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
              {visibleColumns.includes('actions') && (
                <TableHead className="text-right">Actions</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAccounts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={visibleColumns.length} className="text-center py-6 text-muted-foreground">
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
                    <TableCell>
                      <div className="flex flex-col">
                        <span>{formatDate(account.lastReconciledDate)}</span>
                        {account.lastStatementDate && (
                          <span className="text-xs text-muted-foreground">
                            Last statement: {formatDate(account.lastStatementDate)}
                          </span>
                        )}
                      </div>
                    </TableCell>
                  )}
                  {visibleColumns.includes('actions') && (
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleStatementUpload(account)}>
                          <Upload className="h-4 w-4 mr-1" /> Statement
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(account)}>
                          <Edit className="h-4 w-4 mr-1" /> Edit
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-destructive"
                          onClick={() => handleDelete(account.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-1" /> Delete
                        </Button>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {currentAccount && (
        <>
          <BankAccountDialog 
            isOpen={isEditDialogOpen}
            onClose={() => setIsEditDialogOpen(false)}
            onSubmit={handleUpdateAccount}
            account={currentAccount}
            isEditMode={true}
          />
          
          <BankStatementDialog
            isOpen={isStatementDialogOpen}
            onClose={() => setIsStatementDialogOpen(false)}
            account={currentAccount}
          />
        </>
      )}
    </div>
  );
};

export default BankAccountTable;
