
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { EyeIcon, FileDown, FilterIcon } from 'lucide-react';
import { EmptyState } from '@/components/ui/empty-state';

export const FormSubmissions = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [formFilter, setFormFilter] = useState('all');
  
  // Mock data - would come from API
  const mockSubmissions = [
    {
      id: 'sub-1',
      formName: 'Pool Access Waiver',
      submittedBy: 'John Smith',
      submittedAt: new Date().toISOString(),
      status: 'new',
      portal: 'homeowner'
    },
    {
      id: 'sub-2',
      formName: 'ARC Application',
      submittedBy: 'Lisa Johnson',
      submittedAt: new Date(Date.now() - 86400000).toISOString(), // yesterday
      status: 'reviewed',
      portal: 'homeowner'
    },
    {
      id: 'sub-3',
      formName: 'Work Order Request',
      submittedBy: 'Michael Davis',
      submittedAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
      status: 'approved',
      portal: 'homeowner'
    }
  ];
  
  const [submissions, setSubmissions] = useState(mockSubmissions);
  
  const filteredSubmissions = submissions.filter(submission => {
    const matchesTab = activeTab === 'all' || submission.status === activeTab;
    const matchesForm = formFilter === 'all' || submission.formName.includes(formFilter);
    const matchesSearch = 
      submission.submittedBy.toLowerCase().includes(searchQuery.toLowerCase()) ||
      submission.formName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesForm && matchesSearch;
  });
  
  if (submissions.length === 0) {
    return (
      <EmptyState
        title="No Submissions Yet"
        description="Submissions from your forms will appear here."
        icon={<FileDown className="h-10 w-10" />}
      />
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle>Form Submissions</CardTitle>
            <Button variant="outline" size="sm">
              <FileDown className="mr-2 h-4 w-4" /> Export
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="new">New</TabsTrigger>
                <TabsTrigger value="reviewed">Reviewed</TabsTrigger>
                <TabsTrigger value="approved">Approved</TabsTrigger>
                <TabsTrigger value="rejected">Rejected</TabsTrigger>
              </TabsList>
              
              <div className="flex flex-col sm:flex-row gap-3 mb-4">
                <Input
                  placeholder="Search submissions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="max-w-sm"
                />
                <Select value={formFilter} onValueChange={setFormFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="All Forms" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Forms</SelectItem>
                    <SelectItem value="Pool Access Waiver">Pool Access Waiver</SelectItem>
                    <SelectItem value="ARC Application">ARC Application</SelectItem>
                    <SelectItem value="Work Order Request">Work Order Request</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <TabsContent value={activeTab}>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Form Name</TableHead>
                      <TableHead>Submitted By</TableHead>
                      <TableHead>Submitted Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSubmissions.map(submission => (
                      <TableRow key={submission.id}>
                        <TableCell>{submission.formName}</TableCell>
                        <TableCell>{submission.submittedBy}</TableCell>
                        <TableCell>{new Date(submission.submittedAt).toLocaleString()}</TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium
                            ${submission.status === 'new' ? 'bg-blue-100 text-blue-800' : ''}
                            ${submission.status === 'reviewed' ? 'bg-purple-100 text-purple-800' : ''}
                            ${submission.status === 'approved' ? 'bg-green-100 text-green-800' : ''}
                            ${submission.status === 'rejected' ? 'bg-red-100 text-red-800' : ''}
                          `}>
                            {submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">
                            <EyeIcon className="h-4 w-4 mr-2" /> View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TabsContent>
            </Tabs>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
