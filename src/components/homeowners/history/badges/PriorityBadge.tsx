
import React from 'react';
import { Badge } from '@/components/ui/badge';

export const PriorityBadge = ({ priority }: { priority: string }) => {
  switch (priority) {
    case 'low':
      return <Badge variant="outline" className="bg-green-100 text-green-800">Low</Badge>;
    case 'medium':
      return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Medium</Badge>;
    case 'high':
      return <Badge variant="outline" className="bg-orange-100 text-orange-800">High</Badge>;
    case 'urgent':
      return <Badge variant="outline" className="bg-red-100 text-red-800">Urgent</Badge>;
    default:
      return <Badge>{priority}</Badge>;
  }
};
