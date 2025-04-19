
import React, { useMemo } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Edit2 } from 'lucide-react';
import { GLAccount } from '@/types/accounting-types';

interface GLAccountsGroupProps {
  accounts: GLAccount[];
  searchTerm: string;
  onEdit?: (account: GLAccount) => void;
}

const GLAccountGroups: React.FC<GLAccountsGroupProps> = ({
  accounts,
  searchTerm,
  onEdit,
}) => {
  const groupedAccounts = useMemo(() => {
    const filtered = accounts.filter(account => 
      account.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account.type.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return filtered.reduce((groups, account) => {
      const type = account.type || 'Other';
      if (!groups[type]) {
        groups[type] = [];
      }
      groups[type].push(account);
      return groups;
    }, {} as Record<string, GLAccount[]>);
  }, [accounts, searchTerm]);

  return (
    <div className="space-y-6">
      {Object.entries(groupedAccounts).map(([type, accounts]) => (
        <div key={type} className="rounded-md border">
          <div className="bg-muted px-4 py-2 font-medium border-b">
            {type} ({accounts.length})
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-24">Code</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Balance</TableHead>
                <TableHead className="w-24">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {accounts.map((account) => (
                <TableRow key={account.id}>
                  <TableCell className="font-medium">{account.code}</TableCell>
                  <TableCell>{account.name}</TableCell>
                  <TableCell>{account.category}</TableCell>
                  <TableCell className="text-right">
                    ${account.balance?.toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }) || '0.00'}
                  </TableCell>
                  <TableCell>
                    {onEdit && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(account)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ))}
    </div>
  );
};

export default GLAccountGroups;
