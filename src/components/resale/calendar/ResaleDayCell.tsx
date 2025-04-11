
import React from 'react';
import { isToday } from 'date-fns';
import { cn } from '@/lib/utils';
import ResaleDayHeader from './components/ResaleDayHeader';
import ResaleDayContent from './components/ResaleDayContent';

interface ResaleDayCellProps {
  date: Date;
  events: any[];
  eventsLoading: boolean;
  setIsDialogOpen: (isOpen: boolean) => void;
  onDeleteEvent: (eventId: string) => void;
  handleDateSelect: (date: Date) => void;
}

const ResaleDayCell: React.FC<ResaleDayCellProps> = ({
  date,
  events,
  eventsLoading,
  setIsDialogOpen,
  onDeleteEvent,
  handleDateSelect
}) => {
  return (
    <div 
      className={cn(
        "min-h-[60vh] flex flex-col", 
        isToday(date) && "bg-hoa-blue-50 border-t-2 border-t-primary"
      )}
    >
      <ResaleDayHeader date={date} />
      <ResaleDayContent 
        date={date}
        events={events} 
        eventsLoading={eventsLoading} 
        setIsDialogOpen={setIsDialogOpen} 
        onDeleteEvent={onDeleteEvent} 
        setSelectedDate={() => handleDateSelect(date)} 
      />
    </div>
  );
};

export default ResaleDayCell;
