
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { ResaleEventType } from '@/types/resale-event-types';

interface ResaleEventTypeBadgeProps {
  type: ResaleEventType;
}

export const ResaleEventTypeBadge: React.FC<ResaleEventTypeBadgeProps> = ({ type }) => {
  switch (type) {
    case 'rush_order':
      return <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-100">Rush Order</Badge>;
    case 'normal_order':
      return <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-100">Resale Order</Badge>;
    case 'questionnaire':
      return <Badge variant="outline" className="bg-purple-100 text-purple-800 hover:bg-purple-100">Questionnaire</Badge>;
    case 'inspection':
      return <Badge variant="outline" className="bg-orange-100 text-orange-800 hover:bg-orange-100">Inspection</Badge>;
    case 'document_expiration':
      return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Expiration</Badge>;
    case 'document_update':
      return <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">Document Update</Badge>;
    default:
      return <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-100">Event</Badge>;
  }
};

export default ResaleEventTypeBadge;
