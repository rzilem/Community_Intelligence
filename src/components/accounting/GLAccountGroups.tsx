
import React, { useMemo, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Edit2, Eye } from 'lucide-react';
import { GLAccount } from '@/types/accounting-types';
import GLAccountDetailDialog from './GLAccountDetailDialog';
import { useSupabaseUpdate } from '@/hooks/supabase/use-supabase-update';

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
  const [selectedAccount, setSelectedAccount] = useState<GLAccount | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);

  // Add activation/deactivation mutation
  const { mutate: updateAccount, isPending: isActivating } = useSupabaseUpdate<GLAccount>('gl_accounts', {
    showSuccessToast: true,
    showErrorToast: true,
    invalidateQueries: [['gl_accounts']],
  });

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

  const handleViewAccount = (account: GLAccount) => {
    setSelectedAccount(account);
    setIsDetailDialogOpen(true);
  };

  const handleToggleActive = (account: GLAccount) => {
    updateAccount({ id: account.id, data: { is_active: !account.is_active } });
  };

  return (
    <div className="space-y-6">
      {Object.entries(groupedAccounts).map(([type, accounts]) => (
        <div key={type} className="rounded-md border">
          <div className="bg-muted px-4 py-2 font-medium border-b flex justify-between items-center">
            <span>
              {type} ({accounts.length})
            </span>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-24">Code</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Balance</TableHead>
                <TableHead className="w-32">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {accounts.map((account) => (
                <TableRow key={account.id}>
                  <TableCell className="font-medium">{account.code}</TableCell>
                  <TableCell>{account.name}</TableCell>
                  <TableCell>{account.category}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${account.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-muted-foreground'}`}>
                      {account.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    ${account.balance?.toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }) || '0.00'}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewAccount(account)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      
                      {onEdit && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEdit(account)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant={account.is_active ? "outline" : "default"}
                        size="sm"
                        onClick={() => handleToggleActive(account)}
                        disabled={isActivating}
                      >
                        {account.is_active ? "Deactivate" : "Activate"}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ))}

      <GLAccountDetailDialog 
        isOpen={isDetailDialogOpen}
        onClose={() => setIsDetailDialogOpen(false)}
        account={selectedAccount}
      />
    </div>
  );
};

export default GLAccountGroups;
