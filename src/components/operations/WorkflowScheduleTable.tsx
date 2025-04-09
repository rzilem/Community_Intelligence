
import React from 'react';
import { WorkflowSchedule } from '@/types/operations-types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw, Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import { formatDate } from '@/lib/date-utils';

interface WorkflowScheduleTableProps {
  schedules: WorkflowSchedule[];
  isLoading: boolean;
}

const WorkflowScheduleTable: React.FC<WorkflowScheduleTableProps> = ({ schedules, isLoading }) => {
  // Function to render status badge
  const renderStatusBadge = (status: WorkflowSchedule['status']) => {
    switch (status) {
      case 'active':
        return <Badge variant="outline" className="bg-green-100 text-green-800">Active</Badge>;
      case 'paused':
        return <Badge variant="outline" className="bg-amber-100 text-amber-800">Paused</Badge>;
      case 'error':
        return <Badge variant="outline" className="bg-red-100 text-red-800">Error</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800">Completed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Function to render action button based on status
  const renderActionButton = (schedule: WorkflowSchedule) => {
    switch (schedule.status) {
      case 'active':
        return (
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Pause className="h-4 w-4" />
          </Button>
        );
      case 'paused':
        return (
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Play className="h-4 w-4" />
          </Button>
        );
      case 'error':
        return (
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <RotateCcw className="h-4 w-4" />
          </Button>
        );
      case 'completed':
        return (
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <CheckCircle className="h-4 w-4" />
          </Button>
        );
      default:
        return null;
    }
  };

  // Function to render type icon
  const renderTypeIcon = (type: WorkflowSchedule['type']) => {
    switch (type) {
      case 'payment':
        return <Clock className="h-4 w-4 text-blue-600" />;
      case 'file':
        return <Clock className="h-4 w-4 text-green-600" />;
      case 'report':
        return <Clock className="h-4 w-4 text-purple-600" />;
      case 'sync':
        return <Clock className="h-4 w-4 text-amber-600" />;
      case 'maintenance':
        return <Clock className="h-4 w-4 text-gray-600" />;
      case 'notification':
        return <Clock className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return <div className="flex justify-center p-6">Loading workflow schedules...</div>;
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[300px]">Workflow Name</TableHead>
            <TableHead>Schedule Date</TableHead>
            <TableHead>Schedule Time</TableHead>
            <TableHead>Last Run</TableHead>
            <TableHead>Next Run</TableHead>
            <TableHead>End Run</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {schedules.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-6">
                No workflow schedules found
              </TableCell>
            </TableRow>
          ) : (
            schedules.map((schedule) => (
              <TableRow key={schedule.id} className="group hover:bg-muted/50">
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    {renderTypeIcon(schedule.type)}
                    {schedule.name}
                  </div>
                </TableCell>
                <TableCell>{formatDate(schedule.scheduleDate, 'MM/dd/yyyy')}</TableCell>
                <TableCell>{schedule.scheduledTime}</TableCell>
                <TableCell>{formatDate(schedule.lastRun, 'MM/dd/yyyy HH:mm:ss a')}</TableCell>
                <TableCell>{formatDate(schedule.nextRun, 'MM/dd/yyyy HH:mm:ss a')}</TableCell>
                <TableCell>{formatDate(schedule.endRun, 'MM/dd/yyyy HH:mm:ss a')}</TableCell>
                <TableCell>{renderStatusBadge(schedule.status)}</TableCell>
                <TableCell className="text-right">
                  {renderActionButton(schedule)}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default WorkflowScheduleTable;
