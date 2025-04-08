
import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';

interface Event {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  type: 'amenity_booking' | 'hoa_meeting' | 'maintenance' | 'community_event';
  color?: string;
}

interface EventListProps {
  events: Event[];
  loading: boolean;
  setIsDialogOpen: (isOpen: boolean) => void;
  onDeleteEvent?: (eventId: string) => void;
}

export const EventList: React.FC<EventListProps> = ({ 
  events, 
  loading, 
  setIsDialogOpen,
  onDeleteEvent 
}) => {
  return (
    <>
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-3 rounded-md border animate-pulse bg-muted/50 h-16" />
          ))}
        </div>
      ) : events.length > 0 ? (
        <div className="space-y-4">
          {events.map((event) => (
            <div
              key={event.id}
              className={cn(
                "p-3 rounded-md border flex justify-between items-center group relative",
                "border-l-4",
                {
                  "border-l-hoa-blue-500": event.color === '#3b6aff',
                  "border-l-hoa-teal-500": event.color === '#0d766d',
                  "border-l-purple-500": event.color === '#8B5CF6',
                  "border-l-orange-500": event.color === '#f97316', 
                  "border-l-red-500": event.color === '#EF4444',
                  "border-l-green-500": event.color === '#10B981',
                  "border-l-yellow-500": event.color === '#F59E0B',
                  "border-l-pink-500": event.color === '#EC4899',
                }
              )}
              style={{
                borderLeftColor: event.color && !['#3b6aff', '#0d766d', '#8B5CF6', '#f97316', '#EF4444', '#10B981', '#F59E0B', '#EC4899'].includes(event.color) 
                  ? event.color 
                  : undefined
              }}
            >
              <div>
                <h3 className="font-medium">{event.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {event.startTime} - {event.endTime}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className={cn(
                  "text-xs px-2 py-1 rounded-full",
                  {
                    "bg-hoa-blue-100 text-hoa-blue-800": event.type === 'amenity_booking',
                    "bg-hoa-teal-100 text-hoa-teal-800": event.type === 'hoa_meeting',
                    "bg-yellow-100 text-yellow-800": event.type === 'maintenance',
                    "bg-purple-100 text-purple-800": event.type === 'community_event'
                  }
                )}>
                  {event.type === 'amenity_booking' && "Amenity Booking"}
                  {event.type === 'hoa_meeting' && "HOA Meeting"}
                  {event.type === 'maintenance' && "Maintenance"}
                  {event.type === 'community_event' && "Community Event"}
                </span>
                {onDeleteEvent && (
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteEvent(event.id);
                    }}
                    aria-label="Delete event"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-48 text-center">
          <p className="text-muted-foreground">No events scheduled for this day.</p>
          <Button variant="outline" className="mt-4" onClick={() => setIsDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Book Amenity
          </Button>
        </div>
      )}
    </>
  );
};

export default EventList;
