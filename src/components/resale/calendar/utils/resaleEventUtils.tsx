
import React from 'react';
import { CalendarClock, Calendar, ClipboardList, Search, CalendarCheck, FileText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ResaleEventType } from '@/types/resale-event-types';

// Function to get event icon based on type
export const getEventIcon = (type: ResaleEventType) => {
  switch (type) {
    case 'rush_order':
      return <CalendarClock className="h-4 w-4" />;
    case 'normal_order':
      return <Calendar className="h-4 w-4" />;
    case 'questionnaire':
      return <ClipboardList className="h-4 w-4" />;
    case 'inspection':
      return <Search className="h-4 w-4" />;
    case 'document_expiration':
      return <CalendarCheck className="h-4 w-4" />;
    case 'document_update':
      return <FileText className="h-4 w-4" />;
    default:
      return <Calendar className="h-4 w-4" />;
  }
};

// Function to get background class based on event type
export const getEventBackground = (type: ResaleEventType) => {
  switch (type) {
    case 'rush_order':
      return "border-l-red-500";
    case 'normal_order':
      return "border-l-hoa-blue-500";
    case 'questionnaire':
      return "border-l-purple-500";
    case 'inspection':
      return "border-l-orange-500";
    case 'document_expiration':
      return "border-l-yellow-500";
    case 'document_update':
      return "border-l-green-500";
    default:
      return "border-l-hoa-blue-500";
  }
};
