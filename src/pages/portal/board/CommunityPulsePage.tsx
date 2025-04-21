
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { PortalPageLayout } from '@/components/portal/PortalPageLayout';
import { Activity } from 'lucide-react';
import { DashboardTabs } from '@/components/operations/DashboardTabs';
import InvoiceTabContent from '@/components/invoices/InvoiceTabContent';
import WorkOrdersTabContent from '@/components/work-orders/WorkOrdersTabContent';
import ViolationsTabContent from '@/components/violations/ViolationsTabContent';
import { CollectionsTable } from '@/components/collections/CollectionsTable';
import { PortalNavigation } from '@/components/portal/PortalNavigation';
import { useAuth } from '@/contexts/auth';
import { useCollectionsData } from '@/hooks/collections/useCollectionsData';

const CommunityPulsePage = () => {
  const [activeTab, setActiveTab] = useState('invoices');
  const [searchTerm, setSearchTerm] = useState('');
  const { currentAssociation } = useAuth();
  const { accounts, isLoading: collectionsLoading } = useCollectionsData(currentAssociation?.id || '');

  const tabs = [
    { id: 'invoices', label: 'Invoices' },
    { id: 'work-orders', label: 'Work Orders' },
    { id: 'collections', label: 'Collections' },
    { id: 'violations', label: 'Violations' }
  ];

  return (
    <PortalPageLayout 
      title="Community Pulse" 
      icon={<Activity className="h-6 w-6" />}
      description="Monitor and manage community operations"
      portalType="board"
    >
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <PortalNavigation portalType="board" />
        </div>
        
        <div className="lg:col-span-3 space-y-6">
          <Card className="p-6">
            <DashboardTabs 
              tabs={tabs.map(t => t.id)} 
              activeTab={activeTab} 
              onTabChange={setActiveTab}
            />

            <div className="mt-6">
              {activeTab === 'invoices' && (
                <InvoiceTabContent 
                  tabKey={activeTab}
                  searchTerm={searchTerm}
                  onSearchChange={setSearchTerm}
                  onAddInvoice={() => {}}
                  onRefresh={() => {}}
                  onFilterChange={() => {}}
                  invoices={[]}
                  isLoading={false}
                  onViewInvoice={() => {}}
                />
              )}
              {activeTab === 'work-orders' && (
                <WorkOrdersTabContent />
              )}
              {activeTab === 'collections' && (
                <CollectionsTable 
                  accounts={accounts}
                  onSelectAccount={() => {}}
                />
              )}
              {activeTab === 'violations' && (
                <ViolationsTabContent />
              )}
            </div>
          </Card>
        </div>
      </div>
    </PortalPageLayout>
  );
};

export default CommunityPulsePage;
