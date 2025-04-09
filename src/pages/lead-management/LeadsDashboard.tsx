
import React, { useState } from 'react';
import PageTemplate from '@/components/layout/PageTemplate';
import { User, Filter, Plus, RefreshCw, Settings, Download, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import LeadsTable from '@/components/leads/LeadsTable';
import { useLeads } from '@/hooks/leads/useLeads';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

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

  const [activeTab, setActiveTab] = useState('all');
  
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
    <PageTemplate 
      title="Lead Management" 
      icon={<User className="h-8 w-8" />}
      description="Track and manage potential association clients."
    >
      <div className="space-y-6">
        {/* Quick stats cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">New Leads</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{leadCounts.new}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Qualified Leads</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{leadCounts.qualified}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Proposals Sent</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{leadCounts.proposal}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Converted</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{leadCounts.converted}</div>
            </CardContent>
          </Card>
        </div>

        {/* Actions bar */}
        <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center gap-4">
          <div className="flex flex-wrap gap-2">
            <Button 
              variant="outline"
              size="sm"
              onClick={refreshLeads}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
            
            <Button
              size="sm"
              variant="outline"
              onClick={createTestLead}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Test Lead
            </Button>
            
            <Button
              size="sm"
              variant="outline"
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Export
            </Button>
            
            <Button
              size="sm"
              variant="outline"
              className="flex items-center gap-2"
            >
              <Mail className="h-4 w-4" />
              Email Campaign
            </Button>
          </div>

          <div className="flex gap-2 self-end sm:self-auto">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Columns
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {columns.map((column) => (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    checked={visibleColumnIds.includes(column.id)}
                    onCheckedChange={(checked) => {
                      const updatedColumns = checked
                        ? [...visibleColumnIds, column.id]
                        : visibleColumnIds.filter((id) => id !== column.id);
                      updateVisibleColumns(updatedColumns);
                    }}
                  >
                    {column.label}
                  </DropdownMenuCheckboxItem>
                ))}
                <DropdownMenuCheckboxItem
                  className="border-t mt-2"
                  onCheckedChange={() => resetToDefaults()}
                >
                  Reset to defaults
                </DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Button size="sm" variant="outline" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              View Options
            </Button>
          </div>
        </div>

        {/* Tabs and Table */}
        <Card>
          <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
            <div className="flex items-center justify-between px-4 pt-4">
              <TabsList>
                <TabsTrigger value="all" className="flex gap-2 items-center">
                  All
                  <Badge variant="outline">{leadCounts.all}</Badge>
                </TabsTrigger>
                <TabsTrigger value="new" className="flex gap-2 items-center">
                  New
                  <Badge variant="outline">{leadCounts.new}</Badge>
                </TabsTrigger>
                <TabsTrigger value="contacted" className="flex gap-2 items-center">
                  Contacted
                  <Badge variant="outline">{leadCounts.contacted}</Badge>
                </TabsTrigger>
                <TabsTrigger value="qualified" className="flex gap-2 items-center">
                  Qualified
                  <Badge variant="outline">{leadCounts.qualified}</Badge>
                </TabsTrigger>
                <TabsTrigger value="proposal" className="flex gap-2 items-center">
                  Proposal
                  <Badge variant="outline">{leadCounts.proposal}</Badge>
                </TabsTrigger>
                <TabsTrigger value="converted" className="flex gap-2 items-center">
                  Converted
                  <Badge variant="outline">{leadCounts.converted}</Badge>
                </TabsTrigger>
                <TabsTrigger value="lost" className="flex gap-2 items-center">
                  Lost
                  <Badge variant="outline">{leadCounts.lost}</Badge>
                </TabsTrigger>
              </TabsList>
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
  );
};

export default LeadsDashboard;
