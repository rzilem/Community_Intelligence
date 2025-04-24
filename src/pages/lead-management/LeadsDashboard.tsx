
import React, { useState, useEffect } from 'react';
import PageTemplate from '@/components/layout/PageTemplate';
import { User } from 'lucide-react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { useLeads } from '@/hooks/leads/useLeads';
import LeadStatCards from '@/components/leads/LeadStatCards';
import LeadActionButtons from '@/components/leads/LeadActionButtons';
import LeadColumnSelector from '@/components/leads/LeadColumnSelector';
import LeadStatusTabs from '@/components/leads/LeadStatusTabs';
import { useLeadNotifications } from '@/hooks/leads/useLeadNotifications';
import LeadsContent from '@/components/leads/LeadsContent';

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
  
  useEffect(() => {
    markAllAsRead();
  }, []);
  
  // Filter leads based on active tab
  const filteredLeads = leads.filter(lead => {
    if (activeTab === 'all') return true;
    return lead.status === activeTab;
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
    <PageTemplate 
      title="Lead Management" 
      icon={<User className="h-8 w-8" />}
      description="Track and manage potential association clients."
    >
      <div className="space-y-6">
        <LeadStatCards leadCounts={leadCounts} />

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

        <Card>
          <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
            <div className="flex items-center justify-between px-4 pt-4">
              <LeadStatusTabs leadCounts={leadCounts} activeTab={activeTab} />
            </div>
            <CardContent className="pt-4 pb-0">
              <LeadsContent 
                leads={filteredLeads}
                isLoading={isLoading}
                visibleColumnIds={visibleColumnIds}
                columns={columns}
                onDeleteLead={deleteLead}
                onUpdateLeadStatus={updateLeadStatus}
              />
            </CardContent>
            <CardFooter className="text-xs text-muted-foreground py-2 px-4 border-t">
              Last updated: {lastRefreshed.toLocaleTimeString()}
            </CardFooter>
          </Tabs>
        </Card>
      </div>
    </PageTemplate>
  );
};

export default LeadsDashboard;
