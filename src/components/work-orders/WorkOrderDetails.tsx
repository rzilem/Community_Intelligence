
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { WorkOrder } from '@/hooks/useWorkOrders';
import WorkOrderStatusBadge from './WorkOrderStatusBadge';
import { Calendar, DollarSign, User, Clock, FileText } from 'lucide-react';

interface WorkOrderDetailsProps {
  workOrder: WorkOrder;
  onEdit?: () => void;
}

export default function WorkOrderDetails({ workOrder, onEdit }: WorkOrderDetailsProps) {
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Details
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
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Financial
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
