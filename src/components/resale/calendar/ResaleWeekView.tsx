
import React from 'react';
import { isSameDay } from 'date-fns';
import ResaleDayCell from './ResaleDayCell';

interface ResaleWeekViewProps {
  currentWeek: Date[];
  events: any[];
  eventsLoading: boolean;
  handleDeleteEvent: (eventId: string) => void;
}

const ResaleWeekView: React.FC<ResaleWeekViewProps> = ({
  currentWeek,
  events,
  eventsLoading,
  handleDeleteEvent
}) => {
  // Get events for each day of the current week
  const eventsForCurrentWeek = currentWeek.map(day => {
    return {
      date: day,
      events: events.filter(event => isSameDay(new Date(event.date), day))
    };
  });

  // Placeholder functions for the removed functionality
  const setIsDialogOpen = () => {};
  const handleDateSelect = (date: Date) => {};

  return (
    <div className="grid grid-cols-7 h-full divide-x">
      {eventsForCurrentWeek.map(({
        date,
        events
      }, index) => (
        <ResaleDayCell
          key={index}
          date={date}
          events={events}
          eventsLoading={eventsLoading}
          setIsDialogOpen={setIsDialogOpen}
          onDeleteEvent={handleDeleteEvent}
          handleDateSelect={handleDateSelect}
        />
      ))}
    </div>
  );
};

export default ResaleWeekView;
