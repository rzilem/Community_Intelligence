
import React, { useState } from 'react';
import { PiggyBank, FileText, Search, Filter } from 'lucide-react';
import { PortalPageLayout } from '@/components/portal/PortalPageLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth';
import { useCollectionsData } from '@/hooks/collections/useCollectionsData';
import { CollectionsTable } from '@/components/collections/CollectionsTable';
import { CollectionsTimeline } from '@/components/collections/CollectionsTimeline';
import { CollectionAccountDialog } from '@/components/collections/CollectionAccountDialog';
import { formatCurrency } from '@/lib/utils';

const CollectionsPage = () => {
  const { currentAssociation } = useAuth();
  const [activeTab, setActiveTab] = useState('accounts');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);
  const [isAccountDialogOpen, setIsAccountDialogOpen] = useState(false);
  
  const {
    accounts,
    steps,
    history,
    documents,
    paymentPlans,
    payments,
    isLoading,
    setSelectedAccount: updateSelectedAccount,
  } = useCollectionsData(currentAssociation?.id || '');

  const filteredAccounts = accounts.filter(account => {
    const searchLower = searchTerm.toLowerCase();
    return (
      account.property?.address?.toLowerCase().includes(searchLower) ||
      account.resident?.name?.toLowerCase().includes(searchLower) ||
      account.status.toLowerCase().includes(searchLower)
    );
  });

  const handleSelectAccount = (id: string) => {
    updateSelectedAccount(id);
    setSelectedAccount(id);
    setIsAccountDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsAccountDialogOpen(false);
  };

  const handleRefresh = () => {
    updateSelectedAccount(selectedAccount || '');
  };

  const totalDelinquent = accounts.reduce((sum, account) => sum + Number(account.balance_amount), 0);
  const accountCount = accounts.length;
  
  const selectedAccountData = accounts.find(a => a.id === selectedAccount) || null;

  return (
    <PortalPageLayout 
      title="Collections" 
      icon={<PiggyBank className="h-6 w-6" />}
      description="Manage delinquent accounts and collections processes"
      portalType="board"
    >
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-red-600">
                {formatCurrency(totalDelinquent)}
              </div>
              <p className="text-sm text-muted-foreground">
                Total Delinquent Balance
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold">
                {accountCount}
              </div>
              <p className="text-sm text-muted-foreground">
                Delinquent Accounts
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold">
                {paymentPlans.length}
              </div>
              <p className="text-sm text-muted-foreground">
                Active Payment Plans
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold">
                {documents.length}
              </div>
              <p className="text-sm text-muted-foreground">
                Collection Documents
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="accounts">Delinquent Accounts</TabsTrigger>
            <TabsTrigger value="process">Collection Process</TabsTrigger>
          </TabsList>

          <TabsContent value="accounts" className="space-y-4">
            <div className="flex items-center space-x-2">
              <Search className="w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search accounts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
            </div>
            
            <CollectionsTable 
              accounts={filteredAccounts}
              onSelectAccount={handleSelectAccount}
            />
          </TabsContent>

          <TabsContent value="process">
            <Card>
              <CardContent className="p-6">
                <CollectionsTimeline 
                  steps={steps.map(step => ({
                    id: step.id,
                    name: step.name,
                    description: step.description || undefined,
                    completed: false,
                  }))}
                  currentStep={2}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      <CollectionAccountDialog
        account={selectedAccountData}
        steps={steps}
        paymentPlans={paymentPlans}
        payments={payments}
        documents={documents}
        isOpen={isAccountDialogOpen}
        onClose={handleCloseDialog}
        onAccountUpdated={handleRefresh}
      />
    </PortalPageLayout>
  );
};

export default CollectionsPage;
