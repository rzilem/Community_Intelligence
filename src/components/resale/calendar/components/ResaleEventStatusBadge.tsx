
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { ResaleEventStatus } from '@/types/resale-event-types';

interface ResaleEventStatusBadgeProps {
  status?: ResaleEventStatus;
}

export const ResaleEventStatusBadge: React.FC<ResaleEventStatusBadgeProps> = ({ status }) => {
  if (!status) return null;
  
  switch (status) {
    case 'pending':
      return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending</Badge>;
    case 'in_progress':
      return <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-100">In Progress</Badge>;
    case 'completed':
      return <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">Completed</Badge>;
    default:
      return null;
  }
};

export default ResaleEventStatusBadge;
