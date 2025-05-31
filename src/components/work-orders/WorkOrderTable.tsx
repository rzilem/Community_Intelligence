
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { WorkOrder } from '@/hooks/useWorkOrders';
import WorkOrderStatusBadge from './WorkOrderStatusBadge';
import { Edit, Eye } from 'lucide-react';

interface WorkOrderTableProps {
  workOrders: WorkOrder[];
  onEdit?: (workOrder: WorkOrder) => void;
  onView?: (workOrder: WorkOrder) => void;
}

export default function WorkOrderTable({ workOrders, onEdit, onView }: WorkOrderTableProps) {
  const formatCurrency = (amount?: number) => {
    if (!amount) return '';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Title</TableHead>
          <TableHead>Category</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Priority</TableHead>
          <TableHead>Estimated Cost</TableHead>
          <TableHead>Due Date</TableHead>
          <TableHead>Created</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {workOrders.map((workOrder) => (
          <TableRow key={workOrder.id}>
            <TableCell>
              <div>
                <div className="font-medium">{workOrder.title}</div>
                {workOrder.description && (
                  <div className="text-sm text-muted-foreground truncate max-w-xs">
                    {workOrder.description}
                  </div>
                )}
              </div>
            </TableCell>
            <TableCell>{workOrder.category}</TableCell>
            <TableCell>
              <WorkOrderStatusBadge status={workOrder.status} />
            </TableCell>
            <TableCell>
              <WorkOrderStatusBadge status="" priority={workOrder.priority} />
            </TableCell>
            <TableCell>{formatCurrency(workOrder.estimated_cost)}</TableCell>
            <TableCell>
              {workOrder.due_date ? formatDate(workOrder.due_date) : '-'}
            </TableCell>
            <TableCell>{formatDate(workOrder.created_at)}</TableCell>
            <TableCell>
              <div className="flex gap-1">
                {onView && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onView(workOrder)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                )}
                {onEdit && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(workOrder)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
