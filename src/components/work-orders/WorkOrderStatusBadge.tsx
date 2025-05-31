
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface WorkOrderStatusBadgeProps {
  status: string;
  priority?: string;
  className?: string;
}

export default function WorkOrderStatusBadge({ status, priority, className }: WorkOrderStatusBadgeProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-red-100 text-red-800 hover:bg-red-100';
      case 'assigned':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-100';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100';
      case 'on_hold':
        return 'bg-orange-100 text-orange-800 hover:bg-orange-100';
      case 'completed':
        return 'bg-green-100 text-green-800 hover:bg-green-100';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'emergency':
        return 'bg-red-100 text-red-800 hover:bg-red-100';
      case 'high':
        return 'bg-orange-100 text-orange-800 hover:bg-orange-100';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100';
      case 'low':
        return 'bg-green-100 text-green-800 hover:bg-green-100';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
    }
  };

  return (
    <div className={cn("flex gap-2", className)}>
      <Badge className={getStatusColor(status)}>
        {status.replace('_', ' ')}
      </Badge>
      {priority && (
        <Badge className={getPriorityColor(priority)}>
          {priority}
        </Badge>
      )}
    </div>
  );
}
