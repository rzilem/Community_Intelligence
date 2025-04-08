
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { format } from 'date-fns';

// Import our components
import CalendarSidebar from './CalendarSidebar';
import EventList from './EventList';
import EventForm from './EventForm';

// Import our custom hooks
import { useCalendarEvents } from '@/hooks/calendar/useCalendarEvents';
import { useAmenities } from '@/hooks/calendar/useAmenities';

interface CalendarViewProps {
  className?: string;
}

export const CalendarView: React.FC<CalendarViewProps> = ({ className }) => {
  const [date, setDate] = useState<Date>(new Date());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const { amenityOptions } = useAmenities();
  const {
    events: eventsForSelectedDate,
    newEvent,
    setNewEvent,
    eventsLoading,
    isCreating,
    handleCreateEvent,
    handleDeleteEvent,
    hasAssociation
  } = useCalendarEvents({ date });

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      setDate(selectedDate);
    }
  };
  
  const handleSubmitEvent = () => {
    const success = handleCreateEvent();
    if (success) {
      setIsDialogOpen(false);
    }
  };

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
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => setDate(prev => new Date(prev.setDate(prev.getDate() - 1)))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => setDate(prev => new Date(prev.setDate(prev.getDate() + 1)))}
            >
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
                handleCreateEvent={handleSubmitEvent}
                isCreating={isCreating}
                hasAssociation={hasAssociation}
              />
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <EventList
            events={eventsForSelectedDate}
            loading={eventsLoading}
            setIsDialogOpen={setIsDialogOpen}
            onDeleteEvent={handleDeleteEvent}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default CalendarView;
