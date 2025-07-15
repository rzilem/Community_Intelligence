
import React, { useState, useEffect } from 'react';
import PageTemplate from '@/components/layout/PageTemplate';
import AppLayout from '@/components/layout/AppLayout';
import { User } from 'lucide-react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import LeadsTable from '@/components/leads/LeadsTable';
import { useLeads } from '@/hooks/leads/useLeads';
import LeadStatCards from '@/components/leads/LeadStatCards';
import LeadActionButtons from '@/components/leads/LeadActionButtons';
import LeadColumnSelector from '@/components/leads/LeadColumnSelector';
import LeadStatusTabs from '@/components/leads/LeadStatusTabs';
import { useLeadNotifications } from '@/hooks/leads/useLeadNotifications';
import BulkAIProcessor from '@/components/common/BulkAIProcessor';

const LeadsDashboard = () => {
  const { 
    leads, 
    isLoading, 
    refreshLeads, 
    createTestLead,
    deleteLead,
    updateLeadStatus,
    columns,
    visibleColumnIds,
    updateVisibleColumns,
    reorderColumns,
    resetToDefaults,
    lastRefreshed
  } = useLeads();
  
  const { markAllAsRead } = useLeadNotifications();
  const [activeTab, setActiveTab] = useState('all');
  
  // Mark notifications as read when visiting this page
  useEffect(() => {
    markAllAsRead();
  }, []);
  
  // Filter leads based on active tab
  const filteredLeads = leads.filter(lead => {
    if (activeTab === 'all') return true;
    if (activeTab === 'new') return lead.status === 'new';
    if (activeTab === 'contacted') return lead.status === 'contacted';
    if (activeTab === 'qualified') return lead.status === 'qualified';
    if (activeTab === 'proposal') return lead.status === 'proposal';
    if (activeTab === 'converted') return lead.status === 'converted';
    if (activeTab === 'lost') return lead.status === 'lost';
    return true;
  });
  
  // Count leads by status
  const leadCounts = {
    all: leads.length,
    new: leads.filter(lead => lead.status === 'new').length,
    contacted: leads.filter(lead => lead.status === 'contacted').length,
    qualified: leads.filter(lead => lead.status === 'qualified').length,
    proposal: leads.filter(lead => lead.status === 'proposal').length,
    converted: leads.filter(lead => lead.status === 'converted').length,
    lost: leads.filter(lead => lead.status === 'lost').length
  };

  return (
    <AppLayout>
      <PageTemplate 
        title="Lead Management" 
        icon={<User className="h-8 w-8" />}
        description="Track and manage potential association clients."
      >
        <div className="space-y-6">
          {/* Quick stats cards */}
          <LeadStatCards leadCounts={leadCounts} />

          {/* AI Bulk Processing */}
          <BulkAIProcessor
            items={leads}
            itemType="leads"
            onProcessingComplete={refreshLeads}
          />

          {/* Actions bar */}
          <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center gap-4">
            <LeadActionButtons 
              onRefresh={refreshLeads} 
              onCreateTestLead={createTestLead} 
            />

            <LeadColumnSelector
              columns={columns}
              selectedColumns={visibleColumnIds || []}
              onChange={updateVisibleColumns}
              onReorder={reorderColumns}
              resetToDefaults={resetToDefaults}
            />
          </div>

          {/* Tabs and Table */}
          <Card>
            <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
              <div className="flex items-center justify-between px-4 pt-4">
                <LeadStatusTabs leadCounts={leadCounts} activeTab={activeTab} />
              </div>
              <CardContent className="pt-4 pb-0">
                <TabsContent value="all">
                  <LeadsTable 
                    leads={filteredLeads} 
                    isLoading={isLoading}
                    visibleColumnIds={visibleColumnIds}
                    columns={columns}
                    onDeleteLead={deleteLead}
                    onUpdateLeadStatus={updateLeadStatus}
                  />
                </TabsContent>
                <TabsContent value="new">
                  <LeadsTable 
                    leads={filteredLeads} 
                    isLoading={isLoading}
                    visibleColumnIds={visibleColumnIds}
                    columns={columns}
                    onDeleteLead={deleteLead}
                    onUpdateLeadStatus={updateLeadStatus}
                  />
                </TabsContent>
                <TabsContent value="contacted">
                  <LeadsTable 
                    leads={filteredLeads} 
                    isLoading={isLoading}
                    visibleColumnIds={visibleColumnIds}
                    columns={columns}
                    onDeleteLead={deleteLead}
                    onUpdateLeadStatus={updateLeadStatus}
                  />
                </TabsContent>
                <TabsContent value="qualified">
                  <LeadsTable 
                    leads={filteredLeads} 
                    isLoading={isLoading}
                    visibleColumnIds={visibleColumnIds}
                    columns={columns}
                    onDeleteLead={deleteLead}
                    onUpdateLeadStatus={updateLeadStatus}
                  />
                </TabsContent>
                <TabsContent value="proposal">
                  <LeadsTable 
                    leads={filteredLeads} 
                    isLoading={isLoading}
                    visibleColumnIds={visibleColumnIds}
                    columns={columns}
                    onDeleteLead={deleteLead}
                    onUpdateLeadStatus={updateLeadStatus}
                  />
                </TabsContent>
                <TabsContent value="converted">
                  <LeadsTable 
                    leads={filteredLeads} 
                    isLoading={isLoading}
                    visibleColumnIds={visibleColumnIds}
                    columns={columns}
                    onDeleteLead={deleteLead}
                    onUpdateLeadStatus={updateLeadStatus}
                  />
                </TabsContent>
                <TabsContent value="lost">
                  <LeadsTable 
                    leads={filteredLeads} 
                    isLoading={isLoading}
                    visibleColumnIds={visibleColumnIds}
                    columns={columns}
                    onDeleteLead={deleteLead}
                    onUpdateLeadStatus={updateLeadStatus}
                  />
                </TabsContent>
              </CardContent>
              <CardFooter className="text-xs text-muted-foreground py-2 px-4 border-t">
                Last updated: {lastRefreshed.toLocaleTimeString()}
              </CardFooter>
            </Tabs>
          </Card>
        </div>
      </PageTemplate>
    </AppLayout>
  );
};

export default LeadsDashboard;
