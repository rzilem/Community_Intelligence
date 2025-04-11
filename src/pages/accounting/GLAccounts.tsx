
import React, { useState } from 'react';
import PageTemplate from '@/components/layout/PageTemplate';
import { Database } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AssociationSelector from '@/components/associations/AssociationSelector';
import GLAccountTabs from '@/components/accounting/GLAccountTabs';
import { GLAccount } from '@/types/accounting-types';

// Mock data - would normally come from an API or database
const mockGLAccounts: GLAccount[] = [
  { code: '1000', description: 'First Citizens Bank Operating-X2806', type: 'Asset', category: 'Assets' },
  { code: '1015', description: 'First Citizens Bank Capital Improvement-X96', type: 'Asset', category: 'Assets' },
  { code: '1100', description: 'First Citizens Bank Reserve-X7393', type: 'Asset', category: 'Assets' },
  { code: '1102', description: 'CD-X1349', type: 'Asset', category: 'Assets' },
  { code: '1200', description: 'Accounts Receivable', type: 'Asset', category: 'Assets' },
  { code: '1205', description: 'Allowance for Bad Debt', type: 'Asset', category: 'Assets' },
  { code: '1300', description: 'Prepaid Expenses', type: 'Asset', category: 'Assets' },
  { code: '2000', description: 'Accounts Payable', type: 'Liability', category: 'Liabilities' },
  { code: '2100', description: 'Accrued Expenses', type: 'Liability', category: 'Liabilities' },
  { code: '3000', description: 'Operating Fund Balance', type: 'Equity', category: 'Equity' },
  { code: '3100', description: 'Reserve Fund Balance', type: 'Equity', category: 'Equity' },
  { code: '4000', description: 'Assessment Income', type: 'Revenue', category: 'Income' },
  { code: '4100', description: 'Late Fee Income', type: 'Revenue', category: 'Income' },
  { code: '5000', description: 'Landscaping', type: 'Expense', category: 'Expenses' },
  { code: '5100', description: 'Repairs & Maintenance', type: 'Expense', category: 'Expenses' },
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
