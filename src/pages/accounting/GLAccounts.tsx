import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search } from 'lucide-react';
import GLAccountsTable from '@/components/accounting/GLAccountsTable';
import GLAccountDialog from '@/components/accounting/GLAccountDialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/auth/useAuth';

const GLAccounts: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [accountType, setAccountType] = useState('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { user } = useAuth();

  // For demo purposes, using first association
  const associationId = 'demo-association-id';

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleEditAccount = (account: any) => {
    setEditingAccount(account);
    setShowCreateDialog(true);
  };

  const handleDialogClose = () => {
    setShowCreateDialog(false);
    setEditingAccount(null);
  };

  const handleSave = () => {
    handleRefresh();
    handleDialogClose();
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Chart of Accounts</h1>
          <p className="text-muted-foreground">
            Manage your general ledger account structure
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Account
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Account Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search accounts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={accountType} onValueChange={setAccountType}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="asset">Assets</SelectItem>
                <SelectItem value="liability">Liabilities</SelectItem>
                <SelectItem value="equity">Equity</SelectItem>
                <SelectItem value="revenue">Revenue</SelectItem>
                <SelectItem value="expense">Expenses</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <GLAccountsTable
            searchTerm={searchTerm}
            accountType={accountType}
            associationId={associationId}
            onEditAccount={handleEditAccount}
            onRefresh={handleRefresh}
            key={refreshTrigger}
          />
        </CardContent>
      </Card>

      <GLAccountDialog
        open={showCreateDialog}
        onOpenChange={handleDialogClose}
        account={editingAccount}
        associationId={associationId}
        onSave={handleSave}
      />
    </div>
  );
};

export default GLAccounts;