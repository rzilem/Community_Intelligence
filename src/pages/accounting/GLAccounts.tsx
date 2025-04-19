import React, { useState } from 'react';
import PageTemplate from '@/components/layout/PageTemplate';
import { Database } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AssociationSelector from '@/components/associations/AssociationSelector';
import GLAccountTabs from '@/components/accounting/GLAccountTabs';
import { GLAccount } from '@/types/accounting-types';
import { useAuth } from '@/contexts/auth/AuthContext';

const GLAccounts = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [accountType, setAccountType] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('master');
  const [selectedAssociationId, setSelectedAssociationId] = useState<string | undefined>();
  const [accounts, setAccounts] = useState<GLAccount[]>([
    { id: '1', code: '1000', name: 'First Citizens Bank Operating-X2806', type: 'Asset', balance: 0, description: 'First Citizens Bank Operating-X2806', category: 'Assets', account_number: '1000' },
    { id: '2', code: '1015', name: 'First Citizens Bank Capital Improvement-X96', type: 'Asset', balance: 0, description: 'First Citizens Bank Capital Improvement-X96', category: 'Assets', account_number: '1015' },
    { id: '3', code: '1100', name: 'First Citizens Bank Reserve-X7393', type: 'Asset', balance: 0, description: 'First Citizens Bank Reserve-X7393', category: 'Assets', account_number: '1100' },
    { id: '4', code: '1102', name: 'CD-X1349', type: 'Asset', balance: 0, description: 'CD-X1349', category: 'Assets', account_number: '1102' },
    { id: '5', code: '1200', name: 'Accounts Receivable', type: 'Asset', balance: 0, description: 'Accounts Receivable', category: 'Assets', account_number: '1200' },
    { id: '6', code: '1205', name: 'Allowance for Bad Debt', type: 'Asset', balance: 0, description: 'Allowance for Bad Debt', category: 'Assets', account_number: '1205' },
    { id: '7', code: '1300', name: 'Prepaid Expenses', type: 'Asset', balance: 0, description: 'Prepaid Expenses', category: 'Assets', account_number: '1300' },
    { id: '8', code: '2000', name: 'Accounts Payable', type: 'Liability', balance: 0, description: 'Accounts Payable', category: 'Liabilities', account_number: '2000' },
    { id: '9', code: '2100', name: 'Accrued Expenses', type: 'Liability', balance: 0, description: 'Accrued Expenses', category: 'Liabilities', account_number: '2100' },
    { id: '10', code: '3000', name: 'Operating Fund Balance', type: 'Equity', balance: 0, description: 'Operating Fund Balance', category: 'Equity', account_number: '3000' },
    { id: '11', code: '3100', name: 'Reserve Fund Balance', type: 'Equity', balance: 0, description: 'Reserve Fund Balance', category: 'Equity', account_number: '3100' },
    { id: '12', code: '4000', name: 'Assessment Income', type: 'Revenue', balance: 0, description: 'Assessment Income', category: 'Income', account_number: '4000' },
    { id: '13', code: '4100', name: 'Late Fee Income', type: 'Revenue', balance: 0, description: 'Late Fee Income', category: 'Income', account_number: '4100' },
    { id: '14', code: '5000', name: 'Landscaping', type: 'Expense', balance: 0, description: 'Landscaping', category: 'Expenses', account_number: '5000' },
    { id: '15', code: '5100', name: 'Repairs & Maintenance', type: 'Expense', balance: 0, description: 'Repairs & Maintenance', category: 'Expenses', account_number: '5100' },
  ]);

  const handleAssociationChange = (associationId: string) => {
    setSelectedAssociationId(associationId);
  };

  const handleAccountAdded = (newAccount: GLAccount) => {
    setAccounts(prevAccounts => [...prevAccounts, newAccount]);
  };

  return (
    <PageTemplate 
      title="GL Accounts" 
      icon={<Database className="h-8 w-8" />}
      description="Manage general ledger accounts and chart of accounts."
    >
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle>Chart of Accounts</CardTitle>
              <CardDescription>Manage general ledger accounts for your associations</CardDescription>
            </div>
            <AssociationSelector 
              className="md:self-end" 
              onAssociationChange={handleAssociationChange}
            />
          </div>
        </CardHeader>
        <CardContent>
          <GLAccountTabs
            activeTab={activeTab}
            onTabChange={setActiveTab}
            accounts={accounts}
            searchTerm={searchTerm}
            accountType={accountType}
            onSearchChange={setSearchTerm}
            onAccountTypeChange={setAccountType}
            onAccountAdded={handleAccountAdded}
          />
        </CardContent>
      </Card>
    </PageTemplate>
  );
};

export default GLAccounts;
