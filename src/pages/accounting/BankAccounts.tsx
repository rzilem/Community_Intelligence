
import React, { useState } from 'react';
import PageTemplate from '@/components/layout/PageTemplate';
import { Building, Search, PlusCircle, Download } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AssociationSelector from '@/components/associations/AssociationSelector';
import BankAccountTable, { BankAccount } from '@/components/banking/BankAccountTable';
import BankAccountDialog from '@/components/banking/BankAccountDialog';

const mockBankAccounts: BankAccount[] = [
  { 
    id: '1', 
    name: 'Operating Account', 
    accountNumber: '12345678', 
    routingNumber: '987654321', 
    balance: 25436.78, 
    accountType: 'Checking', 
    institution: 'First Citizens Bank', 
    lastReconciled: '2025-03-31' 
  },
  { 
    id: '2', 
    name: 'Reserve Fund', 
    accountNumber: '87654321', 
    routingNumber: '123456789', 
    balance: 125785.42, 
    accountType: 'Money Market', 
    institution: 'First Citizens Bank', 
    lastReconciled: '2025-03-31' 
  },
  { 
    id: '3', 
    name: 'Capital Improvements', 
    accountNumber: '23456789', 
    routingNumber: '987654321', 
    balance: 57892.33, 
    accountType: 'Savings', 
    institution: 'First Citizens Bank', 
    lastReconciled: '2025-03-15' 
  },
  { 
    id: '4', 
    name: 'CD Reserve', 
    accountNumber: '34567890', 
    routingNumber: '123456789', 
    balance: 200000.00, 
    accountType: 'Certificate of Deposit', 
    institution: 'USAA', 
    lastReconciled: '2025-03-01' 
  },
];

const BankAccounts: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [accountTypeFilter, setAccountTypeFilter] = useState<string>('all');
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>(mockBankAccounts);
  const [selectedAssociationId, setSelectedAssociationId] = useState<string | undefined>();

  const filteredAccounts = bankAccounts.filter(account => {
    const matchesSearch = 
      account.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account.accountNumber.includes(searchTerm) ||
      account.institution.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = accountTypeFilter === 'all' || account.accountType.toLowerCase() === accountTypeFilter.toLowerCase();
    
    return matchesSearch && matchesType;
  });

  const handleAssociationChange = (associationId: string) => {
    console.log('Association changed to:', associationId);
    setSelectedAssociationId(associationId);
    // In a real implementation, we would fetch bank accounts for this association
    // For now, we'll just use the mock data
  };

  const handleAddAccount = (data: Partial<BankAccount>) => {
    // In a real implementation, we'd call an API with the selected association ID
    const newAccount: BankAccount = {
      id: Date.now().toString(),
      name: data.name || '',
      accountNumber: data.accountNumber || '',
      routingNumber: data.routingNumber || '',
      balance: data.balance || 0,
      accountType: data.accountType || '',
      institution: data.institution || '',
      lastReconciled: new Date().toISOString().split('T')[0]
    };
    
    setBankAccounts([...bankAccounts, newAccount]);
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
          <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center mb-6">
            <div className="relative w-full md:w-72">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search accounts..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              <Select value={accountTypeFilter} onValueChange={setAccountTypeFilter}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="checking">Checking</SelectItem>
                  <SelectItem value="savings">Savings</SelectItem>
                  <SelectItem value="money market">Money Market</SelectItem>
                  <SelectItem value="certificate of deposit">CD</SelectItem>
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

          <BankAccountTable 
            accounts={filteredAccounts}
            searchTerm={searchTerm}
          />

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
