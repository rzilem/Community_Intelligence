
import React, { useState } from 'react';
import PageTemplate from '@/components/layout/PageTemplate';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AlertTriangle, FilePlus, Check, Shield, Filter, Calendar, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AssociationSelector from '@/components/associations/AssociationSelector';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useComplianceIssues } from '@/hooks/compliance/useComplianceIssues';
import { ComplianceTable } from '@/components/compliance/ComplianceTable';
import ComplianceDialog from '@/components/compliance/ComplianceDialog';
import { useResponsive } from '@/hooks/use-responsive';
import { Compliance } from '@/types/compliance-types';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePickerWithRange } from '@/components/ui/date-range-picker';
import { DateRange } from 'react-day-picker';

const CompliancePage = () => {
  const [selectedAssociationId, setSelectedAssociationId] = useState<string>();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');
  const [selectedIssue, setSelectedIssue] = useState<Compliance | null>(null);
  const { isMobile } = useResponsive();
  
  const { 
    issues, 
    isLoading, 
    error,
    refetchIssues 
  } = useComplianceIssues(selectedAssociationId);

  const handleAssociationChange = (associationId: string) => {
    setSelectedAssociationId(associationId);
  };

  const handleCreateIssue = () => {
    setSelectedIssue(null);
    setIsCreateDialogOpen(true);
  };

  const handleEditIssue = (issue: Compliance) => {
    setSelectedIssue(issue);
    setIsCreateDialogOpen(true);
  };

  const handleDialogClose = (success: boolean) => {
    setIsCreateDialogOpen(false);
    if (success) {
      refetchIssues();
    }
  };

  const openIssues = issues.filter(issue => issue.status === 'open');
  const inProgressIssues = issues.filter(issue => issue.status === 'in-progress');
  const escalatedIssues = issues.filter(issue => issue.status === 'escalated');
  const resolvedIssues = issues.filter(issue => issue.status === 'resolved');

  const filteredIssues = issues.filter(issue => {
    let matches = true;
    
    // Filter by status
    if (selectedStatusFilter !== 'all') {
      matches = matches && issue.status === selectedStatusFilter;
    }
    
    // Filter by date range if set
    if (dateRange?.from) {
      const issueDate = new Date(issue.created_at || '');
      matches = matches && issueDate >= dateRange.from;
      
      if (dateRange.to) {
        matches = matches && issueDate <= dateRange.to;
      }
    }
    
    return matches;
  });

  return (
    <PageTemplate 
      title="Violation Management" 
      icon={<AlertTriangle className="h-8 w-8" />}
      description="Track and manage community rule violations"
    >
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <AssociationSelector 
            className="w-full md:w-[250px]" 
            onAssociationChange={handleAssociationChange}
          />
          <Button 
            onClick={handleCreateIssue}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" /> New Violation
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-muted-foreground">Open</p>
                  <p className="text-2xl font-bold">{openIssues.length}</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center">
                  <AlertTriangle className="h-5 w-5 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-muted-foreground">In Progress</p>
                  <p className="text-2xl font-bold">{inProgressIssues.length}</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <FilePlus className="h-5 w-5 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-muted-foreground">Escalated</p>
                  <p className="text-2xl font-bold">{escalatedIssues.length}</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                  <Shield className="h-5 w-5 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-muted-foreground">Resolved</p>
                  <p className="text-2xl font-bold">{resolvedIssues.length}</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                  <Check className="h-5 w-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
              <div>
                <CardTitle>Violation Management</CardTitle>
                <CardDescription>
                  Track and manage rule violations in your community
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Filter:</span>
              </div>
              
              <Select 
                value={selectedStatusFilter} 
                onValueChange={setSelectedStatusFilter}
              >
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="escalated">Escalated</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                </SelectContent>
              </Select>
              
              <div className="w-full md:w-auto">
                <DatePickerWithRange 
                  value={dateRange} 
                  onChange={setDateRange}
                />
              </div>
              
              <Button 
                variant="ghost"
                onClick={() => {
                  setSelectedStatusFilter('all');
                  setDateRange(undefined);
                }}
              >
                Reset
              </Button>
            </div>
            
            <ComplianceTable 
              issues={filteredIssues}
              isLoading={isLoading}
              error={error}
              onEdit={handleEditIssue}
            />
          </CardContent>
        </Card>
      </div>
      
      <ComplianceDialog
        open={isCreateDialogOpen}
        onOpenChange={handleDialogClose}
        associationId={selectedAssociationId}
        defaultValues={selectedIssue}
      />
    </PageTemplate>
  );
};

export default CompliancePage;
