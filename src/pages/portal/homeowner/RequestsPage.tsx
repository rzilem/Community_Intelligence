import React, { useState } from 'react';
import { PortalPageLayout } from '@/components/portal/PortalPageLayout';
import { FileText, Filter, Plus, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PortalNavigation } from '@/components/portal/PortalNavigation';
import { useAuth } from '@/hooks/auth/useAuth';
import { useAssociationForms } from '@/hooks/form-builder/useAssociationForms';
import { useFormSubmission } from '@/hooks/form-builder/useFormSubmission';

const RequestsPage = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [isSubmitFormDialogOpen, setIsSubmitFormDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [selectedForm, setSelectedForm] = useState<any>(null);
  const { currentAssociation } = useAuth();
  const { submitForm, isSubmitting } = useFormSubmission();
  
  const { data: associationForms = [] } = useAssociationForms(
    currentAssociation?.id,
    'portal_request'
  );
  
  const requests = [
    { id: 1, date: '09/15/2023', title: 'Broken Fence', category: 'Maintenance', status: 'Open', priority: 'Medium' },
    { id: 2, date: '09/10/2023', title: 'Leaking Roof', category: 'Maintenance', status: 'In Progress', priority: 'High' },
    { id: 3, date: '08/27/2023', title: 'Parking Violation', category: 'Compliance', status: 'Resolved', priority: 'Low' },
    { id: 4, date: '08/15/2023', title: 'Tree Removal Request', category: 'Landscaping', status: 'Open', priority: 'Medium' },
  ];

  const handleFormSelection = async (formTemplate: any) => {
    // Show form submission dialog with dynamic form based on template
    setSelectedForm(formTemplate);
    setIsCreateDialogOpen(false);
    setIsSubmitFormDialogOpen(true);
  };

  const handleViewDetails = (request: any) => {
    setSelectedRequest(request);
    setIsDetailsDialogOpen(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Open':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Open</Badge>;
      case 'In Progress':
        return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">In Progress</Badge>;
      case 'Resolved':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Resolved</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'High':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'Medium':
        return <Clock className="h-4 w-4 text-amber-500" />;
      case 'Low':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return null;
    }
  };

  return (
    <PortalPageLayout 
      title="Homeowner Requests" 
      icon={<FileText className="h-6 w-6" />}
      description="Submit and track requests for your property"
      portalType="homeowner"
    >
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <PortalNavigation portalType="homeowner" />
        </div>
        
        <div className="lg:col-span-3 space-y-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-1" />
                Filter
              </Button>
            </div>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-1" />
              New Request
            </Button>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Your Requests</CardTitle>
            </CardHeader>
            <CardContent>
              {/*<Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell>{request.date}</TableCell>
                      <TableCell>{request.title}</TableCell>
                      <TableCell>{request.category}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {getPriorityIcon(request.priority)}
                          <span>{request.priority}</span>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(request.status)}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" onClick={() => handleViewDetails(request)}>
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>*/}
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Submit New Request</DialogTitle>
            <DialogDescription>
              Please select a form to submit your request.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {associationForms.length > 0 ? (
              associationForms.map(form => (
                <Button
                  key={form.id}
                  variant="outline"
                  className="w-full justify-start text-left"
                  onClick={() => handleFormSelection(form)}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  {form.name}
                </Button>
              ))
            ) : (
              <div className="text-center text-muted-foreground py-4">
                No request forms are currently available.
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {selectedRequest && (
        <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{selectedRequest.title}</DialogTitle>
              <DialogDescription>
                Request ID: #{selectedRequest.id} | Submitted on {selectedRequest.date}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Category</p>
                  <p className="font-medium">{selectedRequest.category}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <p>{getStatusBadge(selectedRequest.status)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Priority</p>
                  <div className="flex items-center gap-1">
                    {getPriorityIcon(selectedRequest.priority)}
                    <span className="font-medium">{selectedRequest.priority}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground">Description</p>
                <p className="mt-1">This is a sample description for the {selectedRequest.title} request.</p>
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground">History</p>
                <div className="mt-2 space-y-2">
                  <div className="text-sm border-l-2 border-gray-200 pl-3 py-1">
                    <p className="font-medium">{selectedRequest.date} - Request Submitted</p>
                    <p className="text-muted-foreground">Your request has been submitted and is awaiting review.</p>
                  </div>
                  {selectedRequest.status !== 'Open' && (
                    <div className="text-sm border-l-2 border-gray-200 pl-3 py-1">
                      <p className="font-medium">{selectedRequest.date} - Status Updated</p>
                      <p className="text-muted-foreground">Your request status was updated to {selectedRequest.status}.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <DialogFooter>
              {selectedRequest.status !== 'Resolved' ? (
                <Button variant="outline" onClick={() => setIsDetailsDialogOpen(false)}>
                  <XCircle className="h-4 w-4 mr-1" />
                  Cancel Request
                </Button>
              ) : null}
              <Button onClick={() => setIsDetailsDialogOpen(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </PortalPageLayout>
  );
};

export default RequestsPage;
