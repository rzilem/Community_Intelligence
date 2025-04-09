
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CircleCheck, AlertTriangle, Clock, Pause } from 'lucide-react';
import { WorkflowSchedule } from '@/types/operations-types';

interface WorkflowScheduleStatsProps {
  schedules: WorkflowSchedule[];
}

const WorkflowScheduleStats: React.FC<WorkflowScheduleStatsProps> = ({ schedules }) => {
  // Count schedules by status
  const activeCount = schedules.filter(s => s.status === 'active').length;
  const pausedCount = schedules.filter(s => s.status === 'paused').length;
  const errorCount = schedules.filter(s => s.status === 'error').length;
  const completedCount = schedules.filter(s => s.status === 'completed').length;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Active Workflows</CardTitle>
          <CircleCheck className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{activeCount}</div>
          <p className="text-xs text-muted-foreground">Running on schedule</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Paused Workflows</CardTitle>
          <Pause className="h-4 w-4 text-amber-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{pausedCount}</div>
          <p className="text-xs text-muted-foreground">Temporarily stopped</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Errors</CardTitle>
          <AlertTriangle className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{errorCount}</div>
          <p className="text-xs text-muted-foreground">Requires attention</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Completed</CardTitle>
          <Clock className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{completedCount}</div>
          <p className="text-xs text-muted-foreground">Finished workflows</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default WorkflowScheduleStats;
