
import React, { useState, useEffect } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { useSupabaseQuery } from '@/hooks/supabase';
import { useSupabaseCreate } from '@/hooks/supabase';
import { CalendarEvent } from '@/types/app-types';
import { useAuth } from '@/contexts/AuthContext';

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

  // Query for amenities - fixed to pass table as first parameter
  const { data: amenities, isLoading: amenitiesLoading } = useSupabaseQuery<any[]>(
    'amenities',
    {
      select: '*',
      filter: currentAssociation ? [{ column: 'association_id', value: currentAssociation.id }] : [],
    },
    !!currentAssociation
  );

  // Query for calendar events - fixed to pass table as first parameter
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
      <Card className="lg:col-span-1">
        <CardHeader className="pb-2">
          <CardTitle>Calendar</CardTitle>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleDateSelect}
            className={cn("rounded-md border shadow-sm pointer-events-auto")}
          />
        </CardContent>
      </Card>

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
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Book an Amenity</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="amenity" className="text-right">
                      Amenity
                    </Label>
                    <Select 
                      value={newEvent.amenityId}
                      onValueChange={(value) => setNewEvent({...newEvent, amenityId: value})}
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select an amenity" />
                      </SelectTrigger>
                      <SelectContent>
                        {amenityOptions.map((amenity) => (
                          <SelectItem key={amenity.id} value={amenity.id}>{amenity.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="title" className="text-right">
                      Title
                    </Label>
                    <Input
                      id="title"
                      value={newEvent.title}
                      onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="start-time" className="text-right">
                      Start Time
                    </Label>
                    <Input
                      id="start-time"
                      type="time"
                      value={newEvent.startTime}
                      onChange={(e) => setNewEvent({...newEvent, startTime: e.target.value})}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="end-time" className="text-right">
                      End Time
                    </Label>
                    <Input
                      id="end-time"
                      type="time"
                      value={newEvent.endTime}
                      onChange={(e) => setNewEvent({...newEvent, endTime: e.target.value})}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="event-type" className="text-right">
                      Event Type
                    </Label>
                    <Select
                      value={newEvent.type}
                      onValueChange={(value: any) => setNewEvent({...newEvent, type: value})}
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select event type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="amenity_booking">Amenity Booking</SelectItem>
                        <SelectItem value="hoa_meeting">HOA Meeting</SelectItem>
                        <SelectItem value="maintenance">Maintenance</SelectItem>
                        <SelectItem value="community_event">Community Event</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button 
                    onClick={handleCreateEvent} 
                    disabled={!newEvent.title || !newEvent.startTime || !newEvent.endTime || !currentAssociation || isCreating}
                  >
                    {isCreating ? 'Saving...' : 'Book Now'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {eventsLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-3 rounded-md border animate-pulse bg-muted/50 h-16" />
              ))}
            </div>
          ) : eventsForSelectedDate.length > 0 ? (
            <div className="space-y-4">
              {eventsForSelectedDate.map((event) => (
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
        </CardContent>
      </Card>
    </div>
  );
};

export default CalendarView;
