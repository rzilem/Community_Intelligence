
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, XCircle } from 'lucide-react';
import { formatDate } from '@/lib/date-utils';

// Define workflow schedule item type
export interface WorkflowScheduleItem {
  id: string;
  name: string;
  workflowType: string;
  status: 'completed' | 'in-progress' | 'pending' | 'cancelled';
  association: string;
  dueDate: string;
  startDate: string;
  endDate?: string;
  assignedTo?: string;
}

export interface WorkflowScheduleTableProps {
  scheduleItems?: WorkflowScheduleItem[];
  schedules?: any[]; // Allow for the type used in WorkflowSchedule.tsx
  isLoading?: boolean;
}

const WorkflowScheduleTable: React.FC<WorkflowScheduleTableProps> = ({ 
  scheduleItems = [], 
  schedules = [],
  isLoading = false 
}) => {
  // Function to render the status badge
  const renderStatusBadge = (status: WorkflowScheduleItem['status']) => {
    switch (status) {
      case 'completed':
        return (
          <Badge className="bg-green-100 text-green-800 flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            Completed
          </Badge>
        );
      case 'in-progress':
        return (
          <Badge className="bg-blue-100 text-blue-800 flex items-center gap-1">
            <Clock className="h-3 w-3" />
            In Progress
          </Badge>
        );
      case 'pending':
        return (
          <Badge className="bg-yellow-100 text-yellow-800 flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Pending
          </Badge>
        );
      case 'cancelled':
        return (
          <Badge className="bg-red-100 text-red-800 flex items-center gap-1">
            <XCircle className="h-3 w-3" />
            Cancelled
          </Badge>
        );
      default:
        return null;
    }
  };

  // If loading, show loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center border rounded-lg">
        <Clock className="h-10 w-10 text-gray-400 animate-pulse mb-2" />
        <h3 className="text-lg font-medium text-gray-900">Loading schedules...</h3>
      </div>
    );
  }

  // Determine which data to use - scheduleItems or schedules based on what's provided
  const items = scheduleItems.length > 0 ? scheduleItems : schedules;

  // If no items, show empty state
  if (!items || items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center border rounded-lg">
        <Clock className="h-10 w-10 text-gray-400 mb-2" />
        <h3 className="text-lg font-medium text-gray-900">No scheduled workflows</h3>
        <p className="mt-1 text-sm text-gray-500">
          No workflows are currently scheduled for this time period.
        </p>
      </div>
    );
  }

  // Map the schedules data to the expected format if needed
  const displayItems = scheduleItems.length > 0 ? scheduleItems : schedules.map(schedule => ({
    id: schedule.id,
    name: schedule.name,
    workflowType: schedule.type,
    status: mapStatusToWorkflowItemStatus(schedule.status),
    association: schedule.association || 'All Associations',
    dueDate: schedule.nextRun || schedule.scheduleDate,
    startDate: schedule.lastRun || schedule.scheduleDate,
    endDate: schedule.endRun,
    assignedTo: schedule.assignedTo || 'System'
  }));

  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Workflow Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Association</TableHead>
            <TableHead>Due Date</TableHead>
            <TableHead>Assigned To</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {displayItems.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="font-medium">{item.name}</TableCell>
              <TableCell>{item.workflowType}</TableCell>
              <TableCell>{renderStatusBadge(item.status)}</TableCell>
              <TableCell>{item.association}</TableCell>
              <TableCell>{formatDate(item.dueDate)}</TableCell>
              <TableCell>{item.assignedTo || 'Unassigned'}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

// Helper function to map status from WorkflowSchedule to WorkflowScheduleItem status
function mapStatusToWorkflowItemStatus(status: string): WorkflowScheduleItem['status'] {
  switch (status) {
    case 'active':
      return 'in-progress';
    case 'completed':
      return 'completed';
    case 'error':
      return 'cancelled';
    case 'paused':
      return 'pending';
    default:
      return 'pending';
  }
}

export default WorkflowScheduleTable;
