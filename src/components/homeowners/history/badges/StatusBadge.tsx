
import React from 'react';
import { Badge } from '@/components/ui/badge';

export const StatusBadge = ({ status }: { status: string }) => {
  switch (status) {
    case 'open':
      return <Badge variant="outline" className="bg-blue-100 text-blue-800">Open</Badge>;
    case 'in-progress':
      return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">In Progress</Badge>;
    case 'resolved':
      return <Badge variant="outline" className="bg-green-100 text-green-800">Resolved</Badge>;
    case 'closed':
      return <Badge variant="outline" className="bg-gray-100 text-gray-800">Closed</Badge>;
    default:
      return <Badge>{status}</Badge>;
  }
};

// Add a default export that points to the same component
export default StatusBadge;
