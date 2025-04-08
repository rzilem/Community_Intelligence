
import React, { useState } from 'react';
import PageTemplate from '@/components/layout/PageTemplate';
import { Shield, Filter, Search, Plus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useSupabaseQuery } from '@/hooks/supabase';
import { Compliance } from '@/types/app-types';
import { useAuth } from '@/contexts/AuthContext';
import { ComplianceTable } from '@/components/compliance/ComplianceTable';
import { ComplianceDialog } from '@/components/compliance/ComplianceDialog';
import TooltipButton from '@/components/ui/tooltip-button';

const CompliancePage = () => {
  const { currentAssociation } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTab, setSelectedTab] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCompliance, setSelectedCompliance] = useState<Compliance | null>(null);

  const { data: complianceResponse = [], isLoading, error } = useSupabaseQuery<Compliance[]>(
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
  
  // Ensure complianceIssues is always an array
  const complianceIssues = Array.isArray(complianceResponse) ? complianceResponse : [complianceResponse];

  const filteredCompliance = complianceIssues
    .filter(issue => {
      if (!searchTerm) return true;
      
      const searchLower = searchTerm.toLowerCase();
      return (
        issue.violation_type.toLowerCase().includes(searchLower) ||
        (issue.description && issue.description.toLowerCase().includes(searchLower)) ||
        issue.property_id.toLowerCase().includes(searchLower)
      );
    })
    .filter(issue => {
      if (selectedTab === 'all') return true;
      if (selectedTab === 'open') return issue.status === 'open';
      if (selectedTab === 'in-progress') return issue.status === 'in-progress';
      if (selectedTab === 'resolved') return issue.status === 'resolved';
      return true;
    });

  const openIssues = complianceIssues.filter(issue => issue.status === 'open');
  const inProgressIssues = complianceIssues.filter(issue => issue.status === 'in-progress');
  const resolvedIssues = complianceIssues.filter(issue => issue.status === 'resolved');
  
  const handleAddCompliance = () => {
    setSelectedCompliance(null);
    setIsDialogOpen(true);
  };

  const handleEditCompliance = (compliance: Compliance) => {
    setSelectedCompliance(compliance);
    setIsDialogOpen(true);
  };

  return (
    <PageTemplate
      title="Compliance"
      icon={<Shield className="h-8 w-8" />}
      description="Track and manage community compliance issues and violations."
    >
      <Card className="mb-6">
        <CardContent className="pt-6">
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
                variant="default"
                size="sm"
                onClick={handleAddCompliance}
                tooltip="Add a new compliance issue"
              >
                <Plus className="h-4 w-4 mr-2" /> Add Issue
              </TooltipButton>
            </div>
          </div>
          
          <Tabs defaultValue="all" value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">
                All
                <span className="ml-1.5 rounded-full bg-muted px-2 py-0.5 text-xs">
                  {complianceIssues.length}
                </span>
              </TabsTrigger>
              <TabsTrigger value="open">
                Open
                <span className="ml-1.5 rounded-full bg-red-100 text-red-700 px-2 py-0.5 text-xs">
                  {openIssues.length}
                </span>
              </TabsTrigger>
              <TabsTrigger value="in-progress">
                In Progress
                <span className="ml-1.5 rounded-full bg-yellow-100 text-yellow-700 px-2 py-0.5 text-xs">
                  {inProgressIssues.length}
                </span>
              </TabsTrigger>
              <TabsTrigger value="resolved">
                Resolved
                <span className="ml-1.5 rounded-full bg-green-100 text-green-700 px-2 py-0.5 text-xs">
                  {resolvedIssues.length}
                </span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="all">
              <ComplianceTable
                issues={filteredCompliance}
                isLoading={isLoading}
                error={error}
                onEdit={handleEditCompliance}
              />
            </TabsContent>
            
            <TabsContent value="open">
              <ComplianceTable
                issues={filteredCompliance.filter(issue => issue.status === 'open')}
                isLoading={isLoading}
                error={error}
                onEdit={handleEditCompliance}
              />
            </TabsContent>
            
            <TabsContent value="in-progress">
              <ComplianceTable
                issues={filteredCompliance.filter(issue => issue.status === 'in-progress')}
                isLoading={isLoading}
                error={error}
                onEdit={handleEditCompliance}
              />
            </TabsContent>
            
            <TabsContent value="resolved">
              <ComplianceTable
                issues={filteredCompliance.filter(issue => issue.status === 'resolved')}
                isLoading={isLoading}
                error={error}
                onEdit={handleEditCompliance}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      <ComplianceDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        issue={selectedCompliance}
      />
    </PageTemplate>
  );
};

export default CompliancePage;
