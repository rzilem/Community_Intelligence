import React, { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { GLAccountsService } from '@/services/accounting/gl-accounts-service';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { Database } from '@/integrations/supabase/types';

type GLAccount = Database['public']['Tables']['gl_accounts_enhanced']['Row'];

interface GLAccountsTableProps {
  searchTerm: string;
  accountType: string;
  associationId: string;
  onEditAccount: (account: GLAccount) => void;
  onRefresh?: () => void;
}

const GLAccountsTable: React.FC<GLAccountsTableProps> = ({
  searchTerm,
  accountType,
  associationId,
  onEditAccount,
  onRefresh
}) => {
  const [accounts, setAccounts] = useState<GLAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadAccounts();
  }, [associationId]);

  const loadAccounts = async () => {
    try {
      setLoading(true);
      const data = await GLAccountsService.getAccounts(associationId);
      setAccounts(data);
    } catch (error) {
      console.error('Error loading GL accounts:', error);
      toast({
        title: "Error",
        description: "Failed to load GL accounts",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async (account: GLAccount) => {
    if (!confirm(`Are you sure you want to delete account ${account.account_code} - ${account.account_name}?`)) {
      return;
    }

    try {
      await GLAccountsService.deleteAccount(account.id);
      toast({
        title: "Success",
        description: "Account deleted successfully",
      });
      loadAccounts();
      onRefresh?.();
    } catch (error) {
      console.error('Error deleting account:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete account",
        variant: "destructive",
      });
    }
  };

  const filteredAccounts = accounts.filter(account => {
    const matchesSearch = account.account_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         account.account_code.includes(searchTerm);
    const matchesType = accountType === 'all' || account.account_type === accountType;
    return matchesSearch && matchesType;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-muted-foreground">Loading accounts...</div>
      </div>
    );
  }

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
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => onEditAccount(account)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  {!account.is_system_account && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleDeleteAccount(account)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      {filteredAccounts.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          {accounts.length === 0 ? (
            <div className="space-y-2">
              <AlertCircle className="h-8 w-8 mx-auto text-muted-foreground" />
              <p>No accounts found. Create your first GL account to get started.</p>
            </div>
          ) : (
            <p>No accounts found matching your criteria.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default GLAccountsTable;