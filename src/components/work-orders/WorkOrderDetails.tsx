
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { WorkOrder } from '@/hooks/useWorkOrders';
import WorkOrderStatusBadge from './WorkOrderStatusBadge';
import WorkOrderAttachments from './WorkOrderAttachments';
import WorkOrderHistory from './WorkOrderHistory';
import { Calendar, DollarSign, User, Clock, FileText, Activity, Paperclip } from 'lucide-react';

interface WorkOrderDetailsProps {
  workOrder: WorkOrder;
  onEdit?: () => void;
}

export default function WorkOrderDetails({ workOrder, onEdit }: WorkOrderDetailsProps) {
  // Mock data for attachments and history - in real app, these would come from props or hooks
  const [attachments] = useState([
    {
      id: '1',
      filename: 'before_photo.jpg',
      url: '/api/placeholder/300/200',
      fileType: 'image/jpeg',
      fileSize: 245760,
      uploadedAt: '2024-01-15T10:30:00Z',
      uploadedBy: 'John Doe'
    },
    {
      id: '2',
      filename: 'estimate.pdf',
      url: '/estimate.pdf',
      fileType: 'application/pdf',
      fileSize: 524288,
      uploadedAt: '2024-01-16T14:15:00Z',
      uploadedBy: 'Jane Smith'
    }
  ]);

  const [history] = useState([
    {
      id: '1',
      action: 'created',
      description: 'Work order created',
      performedBy: 'System',
      performedAt: workOrder.created_at
    },
    {
      id: '2',
      action: 'assigned',
      description: 'Assigned to maintenance team',
      performedBy: 'Property Manager',
      performedAt: '2024-01-15T11:00:00Z'
    },
    {
      id: '3',
      action: 'status_change',
      description: 'Status changed from open to in progress',
      performedBy: 'John Doe',
      performedAt: '2024-01-16T09:30:00Z',
      metadata: {
        fieldChanged: 'Status',
        oldValue: 'open',
        newValue: 'in_progress'
      }
    }
  ]);

  const formatCurrency = (amount?: number) => {
    if (!amount) return 'Not specified';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString();
  };

  const handleAttachmentAdd = async (file: File) => {
    // Mock implementation - in real app, this would upload to Supabase storage
    console.log('Uploading file:', file.name);
    // Simulate upload delay
    await new Promise(resolve => setTimeout(resolve, 1000));
  };

  const handleAttachmentDelete = async (attachmentId: string) => {
    // Mock implementation - in real app, this would delete from Supabase storage
    console.log('Deleting attachment:', attachmentId);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold">{workOrder.title}</h2>
          <p className="text-muted-foreground mt-1">Work Order #{workOrder.id.slice(0, 8)}</p>
        </div>
        <div className="flex gap-2">
          <WorkOrderStatusBadge status={workOrder.status} priority={workOrder.priority} />
          {onEdit && (
            <Button variant="outline" onClick={onEdit}>
              Edit
            </Button>
          )}
        </div>
      </div>

      <Tabs defaultValue="details" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="details" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Details
          </TabsTrigger>
          <TabsTrigger value="attachments" className="flex items-center gap-2">
            <Paperclip className="h-4 w-4" />
            Attachments ({attachments.length})
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            History
          </TabsTrigger>
          <TabsTrigger value="timeline" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Timeline
          </TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Work Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Category</label>
                  <p>{workOrder.category}</p>
                </div>
                
                {workOrder.description && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Description</label>
                    <p className="whitespace-pre-wrap">{workOrder.description}</p>
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium text-muted-foreground">Priority</label>
                  <Badge className={
                    workOrder.priority === 'emergency' ? 'bg-red-100 text-red-800' :
                    workOrder.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                    workOrder.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }>
                    {workOrder.priority}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Financial Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Estimated Cost</label>
                  <p>{formatCurrency(workOrder.estimated_cost)}</p>
                </div>
                
                {workOrder.actual_cost && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Actual Cost</label>
                    <p>{formatCurrency(workOrder.actual_cost)}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Timeline
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Created</label>
                  <p>{formatDate(workOrder.created_at)}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Due Date</label>
                  <p>{formatDate(workOrder.due_date)}</p>
                </div>
                
                {workOrder.completed_date && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Completed</label>
                    <p>{formatDate(workOrder.completed_date)}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Assignment
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Assigned To</label>
                  <p>{workOrder.assigned_to || 'Unassigned'}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">Status</label>
                  <WorkOrderStatusBadge status={workOrder.status} />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="attachments">
          <WorkOrderAttachments
            workOrderId={workOrder.id}
            attachments={attachments}
            onAttachmentAdd={handleAttachmentAdd}
            onAttachmentDelete={handleAttachmentDelete}
            canEdit={true}
          />
        </TabsContent>

        <TabsContent value="history">
          <WorkOrderHistory
            workOrderId={workOrder.id}
            history={history}
          />
        </TabsContent>

        <TabsContent value="timeline">
          <Card>
            <CardHeader>
              <CardTitle>Work Order Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Timeline view coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
