
import React, { useState, useEffect } from 'react';
import { startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

// Import refactored components
import ResaleCalendarHeader from './ResaleCalendarHeader';
import ResaleWeekView from './ResaleWeekView';

// Import custom hooks
import { useResaleCalendarEvents } from '@/hooks/resale/useResaleCalendarEvents';

interface ResaleCalendarViewProps {
  className?: string;
  filters: {
    resaleOrders: boolean;
    propertyInspections: boolean;
    documentExpirations: boolean;
    documentUpdates: boolean;
  };
}

export const ResaleCalendarView: React.FC<ResaleCalendarViewProps> = ({
  className,
  filters
}) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentWeek, setCurrentWeek] = useState<Date[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const {
    events,
    newEvent,
    setNewEvent,
    eventsLoading,
    isCreating,
    handleCreateEvent,
    handleDeleteEvent,
    hasAssociation
  } = useResaleCalendarEvents({
    date: selectedDate,
    filters
  });

  useEffect(() => {
    // Get the current week days
    const startWeek = startOfWeek(selectedDate, {
      weekStartsOn: 1
    });
    const endWeek = endOfWeek(selectedDate, {
      weekStartsOn: 1
    });
    const weekDays = eachDayOfInterval({
      start: startWeek,
      end: endWeek
    });
    setCurrentWeek(weekDays);
  }, [selectedDate]);

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  const handleSubmitEvent = () => {
    const success = handleCreateEvent();
    if (success) {
      setIsDialogOpen(false);
    }
    return true;
  };

  return (
    <div className={cn("space-y-4", className)}>
      <Card>
        <ResaleCalendarHeader
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          isDialogOpen={isDialogOpen}
          setIsDialogOpen={setIsDialogOpen}
          newEvent={newEvent}
          setNewEvent={setNewEvent}
          handleSubmitEvent={handleSubmitEvent}
          isCreating={isCreating}
          hasAssociation={hasAssociation}
        />
        <CardContent className="p-0">
          <ResaleWeekView
            currentWeek={currentWeek}
            events={events}
            eventsLoading={eventsLoading}
            setIsDialogOpen={setIsDialogOpen}
            handleDeleteEvent={handleDeleteEvent}
            handleDateSelect={handleDateSelect}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default ResaleCalendarView;
