
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { useSupabaseQuery } from '@/hooks/supabase';
import { useSupabaseCreate } from '@/hooks/supabase';
import { CalendarEvent } from '@/types/app-types';
import { useAuth } from '@/contexts/AuthContext';

// Import our new components
import CalendarSidebar from './CalendarSidebar';
import EventList from './EventList';
import EventForm from './EventForm';

interface Event {
  id: string;
  title: string;
  date: Date;
  startTime: string;
  endTime: string;
  type: 'amenity_booking' | 'hoa_meeting' | 'maintenance' | 'community_event';
  amenityId?: string;
}

interface CalendarViewProps {
  className?: string;
}

export const CalendarView: React.FC<CalendarViewProps> = ({ className }) => {
  const { currentAssociation, user } = useAuth();
  const [date, setDate] = useState<Date>(new Date());
  const [events, setEvents] = useState<Event[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newEvent, setNewEvent] = useState<{
    title: string;
    date: Date;
    startTime: string;
    endTime: string;
    type: 'amenity_booking' | 'hoa_meeting' | 'maintenance' | 'community_event';
    amenityId: string;
  }>({
    title: '',
    date: new Date(),
    startTime: '09:00',
    endTime: '10:00',
    type: 'amenity_booking',
    amenityId: '1'
  });

  // Query for amenities
  const { data: amenities, isLoading: amenitiesLoading } = useSupabaseQuery<any[]>(
    'amenities',
    {
      select: '*',
      filter: currentAssociation ? [{ column: 'association_id', value: currentAssociation.id }] : [],
    },
    !!currentAssociation
  );

  // Query for calendar events
  const { data: calendarEvents, isLoading: eventsLoading } = useSupabaseQuery<CalendarEvent[]>(
    'calendar_events',
    {
      select: '*',
      filter: currentAssociation ? [{ column: 'hoa_id', value: currentAssociation.id }] : [],
    },
    !!currentAssociation
  );

  // Create event mutation
  const { mutate: createEvent, isPending: isCreating } = useSupabaseCreate('calendar_events', {
    showSuccessToast: true,
    invalidateQueries: [['calendar_events']]
  });

  // Convert Supabase events to component events when data changes
  useEffect(() => {
    if (calendarEvents && calendarEvents.length > 0) {
      const formattedEvents: Event[] = calendarEvents.map(event => ({
        id: event.id,
        title: event.title,
        date: new Date(event.start_time),
        startTime: format(new Date(event.start_time), 'HH:mm'),
        endTime: format(new Date(event.end_time), 'HH:mm'),
        type: event.event_type as any,
        amenityId: event.amenity_id || undefined
      }));
      setEvents(formattedEvents);
    }
  }, [calendarEvents]);

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      setDate(selectedDate);
    }
  };
  
  const handleCreateEvent = () => {
    if (!currentAssociation) {
      toast.error("Please select an association first");
      return;
    }

    // Create start and end time Date objects
    const startDate = new Date(newEvent.date);
    const [startHours, startMinutes] = newEvent.startTime.split(':');
    startDate.setHours(parseInt(startHours), parseInt(startMinutes));

    const endDate = new Date(newEvent.date);
    const [endHours, endMinutes] = newEvent.endTime.split(':');
    endDate.setHours(parseInt(endHours), parseInt(endMinutes));

    // Create the event object to save to Supabase
    const eventToSave = {
      hoa_id: currentAssociation.id,
      title: newEvent.title,
      event_type: newEvent.type,
      start_time: startDate.toISOString(),
      end_time: endDate.toISOString(),
      amenity_id: newEvent.amenityId || null,
      booked_by: user?.id || null,
      visibility: 'private' // Default visibility
    };

    console.log("Creating event:", eventToSave);

    // Save to Supabase
    createEvent(eventToSave, {
      onSuccess: () => {
        setIsDialogOpen(false);
        toast.success("Event booked successfully!");
        
        // Reset form
        setNewEvent({
          title: '',
          date: new Date(),
          startTime: '09:00',
          endTime: '10:00',
          type: 'amenity_booking',
          amenityId: '1'
        });
      },
      onError: (error) => {
        console.error("Event creation error:", error);
        toast.error(`Failed to create event: ${error.message}`);
      }
    });
  };

  const eventsForSelectedDate = events.filter(
    event => event.date.toDateString() === date.toDateString()
  );

  const amenityOptions = amenitiesLoading 
    ? [{ id: '1', name: 'Loading...' }]
    : amenities && amenities.length > 0 
      ? amenities 
      : [
          { id: '1', name: 'Swimming Pool' },
          { id: '2', name: 'Tennis Court' },
          { id: '3', name: 'Community Center' },
          { id: '4', name: 'Gym' }
        ];

  return (
    <div className={cn("grid grid-cols-1 lg:grid-cols-3 gap-4", className)}>
      <CalendarSidebar
        date={date}
        handleDateSelect={handleDateSelect}
        className="lg:col-span-1"
      />

      <Card className="lg:col-span-2">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle>Events for {format(date, 'MMMM d, yyyy')}</CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => setDate(prev => new Date(prev.setDate(prev.getDate() - 1)))}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={() => setDate(prev => new Date(prev.setDate(prev.getDate() + 1)))}>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Book Amenity
                </Button>
              </DialogTrigger>
              <EventForm
                newEvent={newEvent}
                setNewEvent={setNewEvent}
                amenityOptions={amenityOptions}
                handleCreateEvent={handleCreateEvent}
                isCreating={isCreating}
                hasAssociation={!!currentAssociation}
              />
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <EventList
            events={eventsForSelectedDate}
            loading={eventsLoading}
            setIsDialogOpen={setIsDialogOpen}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default CalendarView;
