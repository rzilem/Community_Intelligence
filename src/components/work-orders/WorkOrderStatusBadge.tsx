
import React from 'react';
import { Badge } from '@/components/ui/badge';

interface WorkOrderStatusBadgeProps {
  status: string;
  priority?: string;
}

export default function WorkOrderStatusBadge({ status, priority }: WorkOrderStatusBadgeProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-red-100 text-red-800';
      case 'assigned': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'on_hold': return 'bg-orange-100 text-orange-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'emergency': return 'bg-red-100 text-red-800 border-red-300';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low': return 'bg-green-100 text-green-800 border-green-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <div className="flex gap-2">
      <Badge className={getStatusColor(status)}>
        {status.replace('_', ' ')}
      </Badge>
      {priority && (
        <Badge variant="outline" className={getPriorityColor(priority)}>
          {priority}
        </Badge>
      )}
    </div>
  );
}
