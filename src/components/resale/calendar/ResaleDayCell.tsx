
import React from 'react';
import { format, isToday } from 'date-fns';
import { cn } from '@/lib/utils';
import ResaleEventList from './ResaleEventList';

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
      <div 
        className={cn(
          "py-2 px-3 text-center font-medium sticky top-0 bg-background", 
          isToday(date) && "bg-hoa-blue-50 text-primary"
        )}
      >
        <div>{format(date, 'EEE')}</div>
        <div 
          className={cn(
            "text-2xl", 
            isToday(date) && "font-bold text-primary"
          )}
        >
          {format(date, 'd')}
        </div>
      </div>
      <div className="flex-1 p-1 overflow-y-auto">
        <ResaleEventList 
          events={events} 
          loading={eventsLoading} 
          setIsDialogOpen={setIsDialogOpen} 
          onDeleteEvent={onDeleteEvent} 
          compact={true} 
          setSelectedDate={() => handleDateSelect(date)} 
        />
      </div>
    </div>
  );
};

export default ResaleDayCell;
