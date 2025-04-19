
import React, { useState } from 'react';
import { Search, Download, PlusCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { GLAccount } from '@/types/accounting-types';
import GLAccountGroups from './GLAccountGroups';
import { GLAccountDialog } from './GLAccountDialog';
import { useAuth } from '@/contexts/auth/AuthContext';

interface GLAccountsTableProps {
  accounts: GLAccount[];
  searchTerm: string;
  accountType: string;
  onSearchChange: (value: string) => void;
  onAccountTypeChange: (value: string) => void;
  onEdit?: (account: GLAccount) => void;
  onAccountAdded?: (account: GLAccount) => void;
}

const GLAccountsTable: React.FC<GLAccountsTableProps> = ({
  accounts,
  searchTerm,
  accountType,
  onSearchChange,
  onAccountTypeChange,
  onEdit,
  onAccountAdded
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { currentAssociation } = useAuth();

  const filteredAccounts = accounts.filter(account => {
    const matchesType = accountType === 'all' || account.type === accountType;
    return matchesType;
  });

  return (
    <>
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center mb-6">
        <div className="relative w-full md:w-72">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search accounts..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <Select value={accountType} onValueChange={onAccountTypeChange}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="Asset">Asset</SelectItem>
              <SelectItem value="Liability">Liability</SelectItem>
              <SelectItem value="Equity">Equity</SelectItem>
              <SelectItem value="Revenue">Revenue</SelectItem>
              <SelectItem value="Expense">Expense</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" /> Export
          </Button>
          
          <Button onClick={() => setIsDialogOpen(true)}>
            <PlusCircle className="h-4 w-4 mr-2" /> Add Account
          </Button>
        </div>
      </div>

      <GLAccountGroups 
        accounts={filteredAccounts}
        searchTerm={searchTerm}
        onEdit={onEdit}
      />

      <GLAccountDialog 
        isOpen={isDialogOpen} 
        onOpenChange={setIsDialogOpen}
        associationId={currentAssociation?.id}
        onAccountAdded={onAccountAdded}
      />
    </>
  );
};

export default GLAccountsTable;
