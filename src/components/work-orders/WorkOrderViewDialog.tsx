
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { WorkOrder } from '@/hooks/useWorkOrders';
import WorkOrderDetails from './WorkOrderDetails';

interface WorkOrderViewDialogProps {
  workOrder: WorkOrder | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: (workOrder: WorkOrder) => void;
}

export default function WorkOrderViewDialog({ 
  workOrder, 
  open, 
  onOpenChange, 
  onEdit 
}: WorkOrderViewDialogProps) {
  if (!workOrder) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Work Order Details</DialogTitle>
        </DialogHeader>
        <WorkOrderDetails 
          workOrder={workOrder} 
          onEdit={() => onEdit?.(workOrder)}
        />
      </DialogContent>
    </Dialog>
  );
}
