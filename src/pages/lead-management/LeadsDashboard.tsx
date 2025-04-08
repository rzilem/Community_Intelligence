
import React, { useState } from 'react';
import PageTemplate from '@/components/layout/PageTemplate';
import { BarChart, RefreshCw, Mail, Search, PlusCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TabsContent, Tabs } from '@/components/ui/tabs';
import { format } from 'date-fns';
import LeadsDashboardTabNav from '@/components/leads/LeadsDashboardTabNav';
import LeadsTable from '@/components/leads/LeadsTable';
import { useLeads } from '@/hooks/leads/useLeads';

const LeadsDashboard = () => {
  const [activeTab, setActiveTab] = useState('active-leads');
  const [searchTerm, setSearchTerm] = useState('');
  const { leads, isLoading, lastRefreshed, refreshLeads, createTestLead } = useLeads();

  const filteredLeads = leads.filter(lead => 
    lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (lead.company && lead.company.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <PageTemplate 
      title="Leads Dashboard" 
      icon={<BarChart className="h-8 w-8" />}
      description="Overview of lead generation and conversion metrics."
    >
      <div className="space-y-6">
        {/* Header with controls */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <p className="text-sm text-muted-foreground">
              Last refreshed: {format(lastRefreshed, 'MM/dd/yyyy h:mm:ss a')}
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={createTestLead}
              className="flex items-center gap-1"
            >
              <Mail className="h-4 w-4" />
              Create Test Email Lead
            </Button>
            <Button 
              variant="outline" 
              onClick={refreshLeads}
              className="flex items-center gap-1"
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        <Card>
          <CardContent className="p-6">
            <Tabs defaultValue="active-leads" value={activeTab}>
              {/* Tab Navigation */}
              <LeadsDashboardTabNav 
                activeTab={activeTab} 
                onChange={setActiveTab} 
              />

              {/* Search & Create Proposal */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center my-4 gap-3">
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search leads..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
                <Button className="flex-shrink-0">
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Create Proposal
                </Button>
              </div>

              {/* Tab Contents */}
              <TabsContent value="active-leads">
                <LeadsTable 
                  leads={filteredLeads} 
                  isLoading={isLoading} 
                />
              </TabsContent>
              
              <TabsContent value="proposal-templates">
                <div className="min-h-[300px] flex items-center justify-center">
                  <p className="text-muted-foreground">Proposal templates will appear here</p>
                </div>
              </TabsContent>
              
              <TabsContent value="follow-up-emails">
                <div className="min-h-[300px] flex items-center justify-center">
                  <p className="text-muted-foreground">Follow-up email templates will appear here</p>
                </div>
              </TabsContent>
              
              <TabsContent value="analytics">
                <div className="min-h-[300px] flex items-center justify-center">
                  <p className="text-muted-foreground">Lead analytics will appear here</p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </PageTemplate>
  );
};

export default LeadsDashboard;
