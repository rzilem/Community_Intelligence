
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, Edit, Calendar, DollarSign } from 'lucide-react';
import { WorkOrder } from '@/hooks/useWorkOrders';
import WorkOrderStatusBadge from './WorkOrderStatusBadge';

interface WorkOrderTableProps {
  workOrders: WorkOrder[];
  onEdit: (workOrder: WorkOrder) => void;
  onView: (workOrder: WorkOrder) => void;
}

export default function WorkOrderTable({ workOrders, onEdit, onView }: WorkOrderTableProps) {
  const formatCurrency = (amount?: number) => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b">
            <th className="text-left p-4">ID</th>
            <th className="text-left p-4">Title</th>
            <th className="text-left p-4">Category</th>
            <th className="text-left p-4">Status</th>
            <th className="text-left p-4">Priority</th>
            <th className="text-left p-4">Assigned To</th>
            <th className="text-left p-4">Due Date</th>
            <th className="text-left p-4">Est. Cost</th>
            <th className="text-left p-4">Actions</th>
          </tr>
        </thead>
        <tbody>
          {workOrders.map((workOrder) => (
            <tr key={workOrder.id} className="border-b hover:bg-muted/50">
              <td className="p-4">
                <code className="text-xs bg-muted px-2 py-1 rounded">
                  {workOrder.id.slice(0, 8)}
                </code>
              </td>
              <td className="p-4">
                <div>
                  <p className="font-medium">{workOrder.title}</p>
                  {workOrder.description && (
                    <p className="text-sm text-muted-foreground truncate max-w-xs">
                      {workOrder.description}
                    </p>
                  )}
                </div>
              </td>
              <td className="p-4">
                <Badge variant="outline">{workOrder.category}</Badge>
              </td>
              <td className="p-4">
                <WorkOrderStatusBadge 
                  status={workOrder.status} 
                  priority={workOrder.priority}
                />
              </td>
              <td className="p-4">
                <WorkOrderStatusBadge 
                  status={workOrder.status}
                  priority={workOrder.priority} 
                />
              </td>
              <td className="p-4">
                <span className="text-sm">
                  {workOrder.assigned_to || 'Unassigned'}
                </span>
              </td>
              <td className="p-4">
                <div className="flex items-center gap-1 text-sm">
                  <Calendar className="h-3 w-3" />
                  {formatDate(workOrder.due_date)}
                </div>
              </td>
              <td className="p-4">
                <div className="flex items-center gap-1 text-sm">
                  <DollarSign className="h-3 w-3" />
                  {formatCurrency(workOrder.estimated_cost)}
                </div>
              </td>
              <td className="p-4">
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onView(workOrder)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(workOrder)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
