
import React from 'react';
import { PortalPageLayout } from '@/components/portal/PortalPageLayout';
import { PiggyBank } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/auth';
import { useCollectionsData } from '@/hooks/collections/useCollectionsData';
import { CollectionsTable } from '@/components/collections/CollectionsTable';
import { CollectionsTimeline } from '@/components/collections/CollectionsTimeline';

const CollectionsPage = () => {
  const { currentAssociation } = useAuth();
  const [activeTab, setActiveTab] = React.useState('accounts');
  
  const {
    accounts,
    steps,
    history,
    isLoading,
    selectedAccount,
    setSelectedAccount,
  } = useCollectionsData(currentAssociation?.id || '');

  const totalDelinquent = accounts.reduce((sum, account) => sum + Number(account.balance_amount), 0);
  const accountCount = accounts.length;

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
                {new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD'
                }).format(totalDelinquent)}
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
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="accounts">Delinquent Accounts</TabsTrigger>
            <TabsTrigger value="process">Collection Process</TabsTrigger>
          </TabsList>

          <TabsContent value="accounts" className="space-y-4">
            <CollectionsTable 
              accounts={accounts}
              onSelectAccount={setSelectedAccount}
            />
          </TabsContent>

          <TabsContent value="process">
            <Card>
              <CardContent className="p-6">
                <CollectionsTimeline 
                  steps={steps}
                  currentStep={2} // This will need to be dynamic based on the selected account
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PortalPageLayout>
  );
};

export default CollectionsPage;
