
import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, MapPin, Calendar, CalendarCheck, CalendarClock, FileText, ClipboardList, Search } from 'lucide-react';
import { formatDate } from '@/lib/date-utils';

type ResaleEventType = 'rush_order' | 'normal_order' | 'questionnaire' | 'inspection' | 'document_expiration' | 'document_update';

interface ResaleEvent {
  id: string;
  title: string;
  description?: string;
  location?: string;
  type: ResaleEventType;
  startTime: string;
  endTime: string;
  date: Date;
  color?: string;
  status?: 'pending' | 'in_progress' | 'completed';
  property?: string;
}

interface ResaleEventListProps {
  events: ResaleEvent[];
  loading: boolean;
  setIsDialogOpen: (isOpen: boolean) => void;
  onDeleteEvent?: (eventId: string) => void;
  compact?: boolean;
  setSelectedDate?: () => void;
}

export const ResaleEventList: React.FC<ResaleEventListProps> = ({ 
  events, 
  loading, 
  setIsDialogOpen,
  onDeleteEvent,
  compact = false,
  setSelectedDate
}) => {
  // Function to get event icon based on type
  const getEventIcon = (type: ResaleEventType) => {
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
  const getEventBackground = (type: ResaleEventType) => {
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

  // Function to get badge color based on event type
  const getEventBadge = (type: ResaleEventType) => {
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

  // Function to get status badge
  const getStatusBadge = (status?: string) => {
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

  if (loading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-2 rounded-md border animate-pulse bg-muted/50 h-16" />
        ))}
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-4">
        <p className="text-muted-foreground">No events scheduled for this day.</p>
        <Button variant="outline" className="mt-4" onClick={() => {
          setIsDialogOpen(true);
          if (setSelectedDate) setSelectedDate();
        }}>
          <Plus className="h-4 w-4 mr-2" />
          New Order
        </Button>
      </div>
    );
  }

  return (
    <div className={compact ? "space-y-1" : "space-y-3"}>
      {events.map((event) => (
        <div
          key={event.id}
          className={cn(
            "rounded-md border flex flex-col justify-between group relative",
            "border-l-4",
            getEventBackground(event.type),
            compact ? "p-1 text-xs" : "p-3"
          )}
        >
          <div className="flex justify-between items-start gap-2">
            <div className="flex items-start gap-2">
              <div className={cn(
                "flex-shrink-0 mt-0.5",
                compact ? "hidden" : "block"
              )}>
                {getEventIcon(event.type)}
              </div>
              <div>
                <h3 className={cn(
                  "font-medium line-clamp-1",
                  compact && "text-xs"
                )}>
                  {event.title}
                </h3>
                
                {!compact && (
                  <>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {getEventBadge(event.type)}
                      {getStatusBadge(event.status)}
                    </div>
                    
                    <p className="text-sm text-muted-foreground mt-1">
                      {event.startTime} {event.endTime && `- ${event.endTime}`}
                    </p>
                    
                    {event.description && (
                      <p className="text-sm mt-1 text-muted-foreground line-clamp-2">
                        {event.description}
                      </p>
                    )}
                    
                    {event.property && (
                      <p className="text-sm mt-1 flex items-center text-muted-foreground">
                        <MapPin className="h-3 w-3 mr-1" />
                        {event.property}
                      </p>
                    )}
                  </>
                )}
                
                {compact && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                    {event.startTime}
                    {event.property && (
                      <span className="truncate max-w-[80px]" title={event.property}>
                        • {event.property}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            {compact && (
              <div className="flex-shrink-0">
                {getEventBadge(event.type)}
              </div>
            )}
          </div>
          
          {onDeleteEvent && !compact && (
            <div className="flex justify-end mt-2">
              <Button 
                variant="ghost" 
                size="icon"
                className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteEvent(event.id);
                }}
                aria-label="Delete event"
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ResaleEventList;
