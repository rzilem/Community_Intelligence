
import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface Event {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  type: 'amenity_booking' | 'hoa_meeting' | 'maintenance' | 'community_event';
}

interface EventListProps {
  events: Event[];
  loading: boolean;
  setIsDialogOpen: (isOpen: boolean) => void;
}

export const EventList: React.FC<EventListProps> = ({ events, loading, setIsDialogOpen }) => {
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
                "p-3 rounded-md border flex justify-between items-center",
                event.type === 'amenity_booking' && "border-l-4 border-l-hoa-blue-500",
                event.type === 'hoa_meeting' && "border-l-4 border-l-hoa-teal-500",
                event.type === 'maintenance' && "border-l-4 border-l-yellow-500",
                event.type === 'community_event' && "border-l-4 border-l-purple-500"
              )}
            >
              <div>
                <h3 className="font-medium">{event.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {event.startTime} - {event.endTime}
                </p>
              </div>
              <div>
                <span className={cn(
                  "text-xs px-2 py-1 rounded-full",
                  event.type === 'amenity_booking' && "bg-hoa-blue-100 text-hoa-blue-800",
                  event.type === 'hoa_meeting' && "bg-hoa-teal-100 text-hoa-teal-800",
                  event.type === 'maintenance' && "bg-yellow-100 text-yellow-800",
                  event.type === 'community_event' && "bg-purple-100 text-purple-800"
                )}>
                  {event.type === 'amenity_booking' && "Amenity Booking"}
                  {event.type === 'hoa_meeting' && "HOA Meeting"}
                  {event.type === 'maintenance' && "Maintenance"}
                  {event.type === 'community_event' && "Community Event"}
                </span>
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
