
import React, { useState } from 'react';
import PageTemplate from '@/components/layout/PageTemplate';
import { Shield, Plus, Search, Filter, Download } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useSupabaseQuery } from '@/hooks/supabase';
import { Compliance } from '@/types/app-types';
import { useAuth } from '@/contexts/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ComplianceTable } from '@/components/compliance/ComplianceTable';
import { ComplianceDialog } from '@/components/compliance/ComplianceDialog';
import TooltipButton from '@/components/ui/tooltip-button';

const CompliancePage = () => {
  const { currentAssociation } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<string>('open');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<Compliance | null>(null);

  const { data: complianceIssues, isLoading, error } = useSupabaseQuery<Compliance[]>(
    'compliance_issues',
    {
      select: '*',
      filter: currentAssociation ? [
        { column: 'association_id', value: currentAssociation.id }
      ] : [],
      order: { column: 'created_at', ascending: false },
    },
    !!currentAssociation
  );

  const filteredIssues = complianceIssues?.filter(issue => {
    // First filter by tab status
    const matchesStatus = 
      (activeTab === 'open' && issue.status === 'open') ||
      (activeTab === 'escalated' && issue.status === 'escalated') ||
      (activeTab === 'resolved' && issue.status === 'resolved') ||
      (activeTab === 'all');
      
    if (!matchesStatus) return false;
    
    // Then apply search filter if needed
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      issue.violation_type.toLowerCase().includes(searchLower) || 
      (issue.description && issue.description.toLowerCase().includes(searchLower)) ||
      issue.property_id.includes(searchTerm)
    );
  });

  const handleAddIssue = () => {
    setSelectedIssue(null);
    setIsDialogOpen(true);
  };

  const handleEditIssue = (issue: Compliance) => {
    setSelectedIssue(issue);
    setIsDialogOpen(true);
  };

  return (
    <PageTemplate 
      title="Compliance" 
      icon={<Shield className="h-8 w-8" />}
      description="Track and manage HOA violations, inspections, and compliance issues."
    >
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-between mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search compliance issues..." 
                className="pl-8"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <TooltipButton
                variant="outline"
                size="sm"
                tooltip="Filter compliance issues"
              >
                <Filter className="h-4 w-4 mr-2" /> Filter
              </TooltipButton>
              
              <TooltipButton
                variant="outline"
                size="sm" 
                tooltip="Export compliance data"
              >
                <Download className="h-4 w-4 mr-2" /> Export
              </TooltipButton>
              
              <TooltipButton
                variant="default"
                size="sm"
                onClick={handleAddIssue}
                tooltip="Report a new issue"
              >
                <Plus className="h-4 w-4 mr-2" /> Report Issue
              </TooltipButton>
            </div>
          </div>
          
          <Tabs 
            defaultValue="open" 
            className="mt-6"
            onValueChange={setActiveTab}
          >
            <TabsList className="mb-6">
              <TabsTrigger value="open">Open</TabsTrigger>
              <TabsTrigger value="escalated">Escalated</TabsTrigger>
              <TabsTrigger value="resolved">Resolved</TabsTrigger>
              <TabsTrigger value="all">All Issues</TabsTrigger>
            </TabsList>
            
            <TabsContent value="open">
              <ComplianceTable 
                issues={filteredIssues || []}
                isLoading={isLoading} 
                error={error}
                onEdit={handleEditIssue}
              />
            </TabsContent>
            
            <TabsContent value="escalated">
              <ComplianceTable 
                issues={filteredIssues || []}
                isLoading={isLoading} 
                error={error}
                onEdit={handleEditIssue}
              />
            </TabsContent>
            
            <TabsContent value="resolved">
              <ComplianceTable 
                issues={filteredIssues || []}
                isLoading={isLoading} 
                error={error}
                onEdit={handleEditIssue}
              />
            </TabsContent>
            
            <TabsContent value="all">
              <ComplianceTable 
                issues={filteredIssues || []}
                isLoading={isLoading} 
                error={error}
                onEdit={handleEditIssue}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      <ComplianceDialog 
        open={isDialogOpen} 
        onOpenChange={setIsDialogOpen} 
        issue={selectedIssue} 
      />
    </PageTemplate>
  );
};

export default CompliancePage;
