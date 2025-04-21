
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PortalPageLayout } from '@/components/portal/PortalPageLayout';
import { 
  FileText, 
  WrenchIcon, 
  PiggyBank, 
  AlertTriangle, 
  Filter, 
  Search 
} from 'lucide-react';
import { DashboardTabs } from '@/components/operations/DashboardTabs';
import { InvoiceTabContent } from '@/components/invoices/InvoiceTabContent';
import { useAuth } from '@/contexts/auth';
import { PortalNavigation } from '@/components/portal/PortalNavigation';

const OperationsPage = () => {
  const [activeTab, setActiveTab] = useState('invoices');
  const [searchTerm, setSearchTerm] = useState('');
  const { currentAssociation } = useAuth();

  const tabs = [
    { id: 'invoices', label: 'Invoices', icon: <FileText className="h-4 w-4" /> },
    { id: 'work-orders', label: 'Work Orders', icon: <WrenchIcon className="h-4 w-4" /> },
    { id: 'collections', label: 'Collections', icon: <PiggyBank className="h-4 w-4" /> },
    { id: 'violations', label: 'Violations', icon: <AlertTriangle className="h-4 w-4" /> }
  ];

  return (
    <PortalPageLayout 
      title="Operations" 
      icon={<FileText className="h-6 w-6" />}
      description="Manage association operations"
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
                <div>Work Orders content will go here</div>
              )}
              {activeTab === 'collections' && (
                <div>Collections content will go here</div>
              )}
              {activeTab === 'violations' && (
                <div>Violations content will go here</div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </PortalPageLayout>
  );
};

export default OperationsPage;
