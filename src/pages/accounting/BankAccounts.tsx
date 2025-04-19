
import React, { useState, useEffect } from 'react';
import PageTemplate from '@/components/layout/PageTemplate';
import { Building, Search, Download, PlusCircle, Upload } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AssociationSelector from '@/components/associations/AssociationSelector';
import BankAccountTable, { BankAccount } from '@/components/banking/BankAccountTable';
import BankAccountDialog from '@/components/banking/BankAccountDialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const BankAccounts: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [accountTypeFilter, setAccountTypeFilter] = useState<string>('all');
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [selectedAssociationId, setSelectedAssociationId] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(true);

  const fetchBankAccounts = async () => {
    try {
      setIsLoading(true);
      
      let query = supabase
        .from('bank_accounts')
        .select('*');
      
      if (selectedAssociationId) {
        query = query.eq('association_id', selectedAssociationId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      // Map database fields to component props
      const mappedAccounts: BankAccount[] = data.map(account => ({
        id: account.id,
        name: account.name,
        accountNumber: account.account_number,
        routingNumber: account.routing_number || '',
        balance: 0, // We'll fetch this from transactions later
        accountType: account.account_type,
        institution: account.bank_name,
        lastReconciledDate: account.last_reconciled_date,
        lastStatementDate: account.last_statement_date
      }));
      
      setBankAccounts(mappedAccounts);
    } catch (error: any) {
      console.error('Error fetching bank accounts:', error);
      toast.error(`Failed to load bank accounts: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (selectedAssociationId) {
      fetchBankAccounts();
    }
  }, [selectedAssociationId]);

  const filteredAccounts = bankAccounts.filter(account => {
    const matchesSearch = 
      account.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account.accountNumber.includes(searchTerm) ||
      account.institution.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = accountTypeFilter === 'all' || account.accountType.toLowerCase() === accountTypeFilter.toLowerCase();
    
    return matchesSearch && matchesType;
  });

  const handleAssociationChange = (associationId: string) => {
    setSelectedAssociationId(associationId);
  };

  const handleAddAccount = async (data: Partial<BankAccount>) => {
    if (!selectedAssociationId) {
      toast.error('Please select an association first');
      return;
    }
    
    try {
      const { data: newAccount, error } = await supabase
        .from('bank_accounts')
        .insert({
          name: data.name,
          account_number: data.accountNumber,
          routing_number: data.routingNumber,
          account_type: data.accountType,
          bank_name: data.institution,
          association_id: selectedAssociationId
        })
        .select()
        .single();
      
      if (error) throw error;
      
      toast.success('Bank account added successfully');
      fetchBankAccounts();
    } catch (error: any) {
      console.error('Error adding bank account:', error);
      toast.error(`Failed to add bank account: ${error.message}`);
    }
  };

  const handleUpdateAccount = async (account: BankAccount) => {
    try {
      const { error } = await supabase
        .from('bank_accounts')
        .update({
          name: account.name,
          account_number: account.accountNumber,
          routing_number: account.routingNumber,
          account_type: account.accountType,
          bank_name: account.institution
        })
        .eq('id', account.id);
      
      if (error) throw error;
      
      toast.success('Bank account updated successfully');
      fetchBankAccounts();
    } catch (error: any) {
      console.error('Error updating bank account:', error);
      toast.error(`Failed to update bank account: ${error.message}`);
    }
  };

  const handleDeleteAccount = async (id: string) => {
    try {
      const { error } = await supabase
        .from('bank_accounts')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      toast.success('Bank account deleted successfully');
      fetchBankAccounts();
    } catch (error: any) {
      console.error('Error deleting bank account:', error);
      toast.error(`Failed to delete bank account: ${error.message}`);
    }
  };

  return (
    <PageTemplate 
      title="Bank Accounts" 
      icon={<Building className="h-8 w-8" />}
      description="Manage association bank accounts and financial institutions."
    >
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle>Financial Accounts</CardTitle>
              <CardDescription>Manage bank and investment accounts for your associations</CardDescription>
            </div>
            <AssociationSelector 
              className="md:self-end" 
              onAssociationChange={handleAssociationChange} 
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-6">
            <div className="relative w-full md:w-72">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search accounts..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 w-full md:w-auto">
              <Select value={accountTypeFilter} onValueChange={setAccountTypeFilter}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="checking">Checking</SelectItem>
                  <SelectItem value="savings">Savings</SelectItem>
                  <SelectItem value="money_market">Money Market</SelectItem>
                  <SelectItem value="cd">Certificate of Deposit</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" onClick={() => console.log('Export functionality')}>
                <Download className="h-4 w-4 mr-2" /> Export
              </Button>

              <Button onClick={() => setIsDialogOpen(true)}>
                <PlusCircle className="h-4 w-4 mr-2" /> Add Account
              </Button>
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-8">Loading bank accounts...</div>
          ) : selectedAssociationId ? (
            <BankAccountTable 
              accounts={filteredAccounts}
              searchTerm={searchTerm}
              onUpdateAccount={handleUpdateAccount}
              onDeleteAccount={handleDeleteAccount}
            />
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Please select an association to view bank accounts
            </div>
          )}

          <BankAccountDialog 
            isOpen={isDialogOpen}
            onClose={() => setIsDialogOpen(false)}
            onSubmit={handleAddAccount}
          />
        </CardContent>
      </Card>
    </PageTemplate>
  );
};

export default BankAccounts;
