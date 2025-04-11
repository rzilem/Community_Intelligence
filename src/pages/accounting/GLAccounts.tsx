import React, { useState } from 'react';
import PageTemplate from '@/components/layout/PageTemplate';
import { Database } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AssociationSelector from '@/components/associations/AssociationSelector';
import GLAccountTabs from '@/components/accounting/GLAccountTabs';
import { GLAccount } from '@/types/accounting-types';

// Mock data - would normally come from an API or database
const mockGLAccounts: GLAccount[] = [
  { id: '1', number: '1000', name: 'First Citizens Bank Operating-X2806', type: 'Asset', balance: 0, code: '1000', description: 'First Citizens Bank Operating-X2806', category: 'Assets' },
  { id: '2', number: '1015', name: 'First Citizens Bank Capital Improvement-X96', type: 'Asset', balance: 0, code: '1015', description: 'First Citizens Bank Capital Improvement-X96', category: 'Assets' },
  { id: '3', number: '1100', name: 'First Citizens Bank Reserve-X7393', type: 'Asset', balance: 0, code: '1100', description: 'First Citizens Bank Reserve-X7393', category: 'Assets' },
  { id: '4', number: '1102', name: 'CD-X1349', type: 'Asset', balance: 0, code: '1102', description: 'CD-X1349', category: 'Assets' },
  { id: '5', number: '1200', name: 'Accounts Receivable', type: 'Asset', balance: 0, code: '1200', description: 'Accounts Receivable', category: 'Assets' },
  { id: '6', number: '1205', name: 'Allowance for Bad Debt', type: 'Asset', balance: 0, code: '1205', description: 'Allowance for Bad Debt', category: 'Assets' },
  { id: '7', number: '1300', name: 'Prepaid Expenses', type: 'Asset', balance: 0, code: '1300', description: 'Prepaid Expenses', category: 'Assets' },
  { id: '8', number: '2000', name: 'Accounts Payable', type: 'Liability', balance: 0, code: '2000', description: 'Accounts Payable', category: 'Liabilities' },
  { id: '9', number: '2100', name: 'Accrued Expenses', type: 'Liability', balance: 0, code: '2100', description: 'Accrued Expenses', category: 'Liabilities' },
  { id: '10', number: '3000', name: 'Operating Fund Balance', type: 'Equity', balance: 0, code: '3000', description: 'Operating Fund Balance', category: 'Equity' },
  { id: '11', number: '3100', name: 'Reserve Fund Balance', type: 'Equity', balance: 0, code: '3100', description: 'Reserve Fund Balance', category: 'Equity' },
  { id: '12', number: '4000', name: 'Assessment Income', type: 'Revenue', balance: 0, code: '4000', description: 'Assessment Income', category: 'Income' },
  { id: '13', number: '4100', name: 'Late Fee Income', type: 'Revenue', balance: 0, code: '4100', description: 'Late Fee Income', category: 'Income' },
  { id: '14', number: '5000', name: 'Landscaping', type: 'Expense', balance: 0, code: '5000', description: 'Landscaping', category: 'Expenses' },
  { id: '15', number: '5100', name: 'Repairs & Maintenance', type: 'Expense', balance: 0, code: '5100', description: 'Repairs & Maintenance', category: 'Expenses' },
];

const GLAccounts = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [accountType, setAccountType] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('master');
  const [visibleColumns, setVisibleColumns] = useState<Array<'code' | 'description' | 'type' | 'category'>>([
    'code', 'description', 'type', 'category'
  ]);
  const [selectedAssociationId, setSelectedAssociationId] = useState<string | undefined>();

  const handleAssociationChange = (associationId: string) => {
    setSelectedAssociationId(associationId);
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
            accounts={mockGLAccounts}
            searchTerm={searchTerm}
            accountType={accountType}
            visibleColumns={visibleColumns}
            onSearchChange={setSearchTerm}
            onAccountTypeChange={setAccountType}
            onColumnChange={(columns) => setVisibleColumns(columns as Array<'code' | 'description' | 'type' | 'category'>)}
          />
        </CardContent>
      </Card>
    </PageTemplate>
  );
};

export default GLAccounts;
