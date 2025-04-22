
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useSupabaseQuery } from '@/hooks/supabase';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Eye, Download, Check, X, Clock } from 'lucide-react';
import { FormTemplate } from '@/types/form-builder-types';
import { format } from 'date-fns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';

interface FormSubmission {
  id: string;
  form_template_id: string;
  user_id: string;
  association_id: string;
  property_id: string | null;
  form_data: Record<string, any>;
  status: 'pending' | 'approved' | 'rejected' | 'processed' | 'archived';
  tracking_number: string;
  submitted_at: string;
  processed_at?: string;
  processed_by?: string;
  notes?: string;
}

interface FormSubmissionsProps {
  associationId?: string;
  templateId?: string;
}

export const FormSubmissions: React.FC<FormSubmissionsProps> = ({ 
  associationId,
  templateId
}) => {
  const [selectedSubmission, setSelectedSubmission] = useState<FormSubmission | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: submissions = [], isLoading } = useSupabaseQuery<FormSubmission[]>(
    'form_submissions',
    {
      select: '*',
      filter: [
        ...(associationId ? [{ column: 'association_id', value: associationId }] : []),
        ...(templateId ? [{ column: 'form_template_id', value: templateId }] : [])
      ],
      order: { column: 'submitted_at', ascending: false }
    },
    true
  );

  const { data: templates = [] } = useSupabaseQuery<FormTemplate[]>(
    'form_templates',
    {
      select: 'id, name',
    },
    true
  );

  const filteredSubmissions = submissions.filter(submission => {
    // Filter by status
    if (filterStatus !== "all" && submission.status !== filterStatus) {
      return false;
    }
    
    // Filter by search query (tracking number or form data content)
    if (searchQuery) {
      const lowerSearch = searchQuery.toLowerCase();
      const matchesTracking = submission.tracking_number.toLowerCase().includes(lowerSearch);
      const matchesFormData = JSON.stringify(submission.form_data).toLowerCase().includes(lowerSearch);
      if (!matchesTracking && !matchesFormData) {
        return false;
      }
    }
    
    return true;
  });

  const viewSubmission = (submission: FormSubmission) => {
    setSelectedSubmission(submission);
    setViewDialogOpen(true);
  };

  const getTemplateNameById = (id: string) => {
    const template = templates.find(t => t.id === id);
    return template ? template.name : 'Unknown Form';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="flex items-center gap-1"><Clock className="h-3 w-3" /> Pending</Badge>;
      case 'approved':
        return <Badge variant="success" className="flex items-center gap-1"><Check className="h-3 w-3" /> Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive" className="flex items-center gap-1"><X className="h-3 w-3" /> Rejected</Badge>;
      case 'processed':
        return <Badge variant="secondary" className="flex items-center gap-1"><Check className="h-3 w-3" /> Processed</Badge>;
      case 'archived':
        return <Badge variant="outline" className="flex items-center gap-1">Archived</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Form Submissions</CardTitle>
          <CardDescription>Loading submissions...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>Form Submissions</CardTitle>
        <CardDescription>View and manage form submissions</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-4 mb-4 justify-between">
          <div className="flex flex-1 gap-4">
            <Input
              placeholder="Search by tracking number or content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-sm"
            />
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="processed">Processed</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {filteredSubmissions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No submissions found.</p>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tracking #</TableHead>
                  <TableHead>Form</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSubmissions.map((submission) => (
                  <TableRow key={submission.id}>
                    <TableCell className="font-medium">{submission.tracking_number}</TableCell>
                    <TableCell>{getTemplateNameById(submission.form_template_id)}</TableCell>
                    <TableCell>{format(new Date(submission.submitted_at), 'MMM d, yyyy')}</TableCell>
                    <TableCell>{getStatusBadge(submission.status)}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => viewSubmission(submission)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Submission Details</DialogTitle>
            </DialogHeader>
            
            {selectedSubmission && (
              <Tabs defaultValue="details">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="raw">Raw Data</TabsTrigger>
                </TabsList>
                
                <TabsContent value="details" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium">Tracking Number</p>
                      <p>{selectedSubmission.tracking_number}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Status</p>
                      <p>{getStatusBadge(selectedSubmission.status)}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Form Type</p>
                      <p>{getTemplateNameById(selectedSubmission.form_template_id)}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Submitted</p>
                      <p>{format(new Date(selectedSubmission.submitted_at), 'MMMM d, yyyy h:mm a')}</p>
                    </div>
                  </div>
                  
                  <div className="border rounded-lg p-4 space-y-4">
                    <h3 className="font-medium">Form Data</h3>
                    <div className="space-y-3">
                      {Object.entries(selectedSubmission.form_data).map(([key, value]) => (
                        <div key={key} className="grid grid-cols-3 gap-2">
                          <div className="text-sm font-medium capitalize col-span-1">
                            {key.replace(/_/g, ' ')}
                          </div>
                          <div className="col-span-2 break-words">
                            {typeof value === 'object' 
                              ? JSON.stringify(value) 
                              : String(value)
                            }
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setViewDialogOpen(false)}>Close</Button>
                    <Button variant="default">
                      <Download className="h-4 w-4 mr-2" />
                      Export PDF
                    </Button>
                  </div>
                </TabsContent>
                
                <TabsContent value="raw">
                  <pre className="bg-muted p-4 rounded-md overflow-auto max-h-96 text-xs">
                    {JSON.stringify(selectedSubmission, null, 2)}
                  </pre>
                </TabsContent>
              </Tabs>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};
