
import React from 'react';
import ResaleEventList from '../ResaleEventList';

interface ResaleDayContentProps {
  date: Date;
  events: any[];
  eventsLoading: boolean;
  setIsDialogOpen: (isOpen: boolean) => void;
  onDeleteEvent: (eventId: string) => void;
  setSelectedDate: () => void;
}

const ResaleDayContent: React.FC<ResaleDayContentProps> = ({
  events,
  eventsLoading,
  setIsDialogOpen,
  onDeleteEvent,
  setSelectedDate
}) => {
  return (
    <div className="flex-1 p-1 overflow-y-auto">
      <ResaleEventList 
        events={events} 
        loading={eventsLoading} 
        setIsDialogOpen={setIsDialogOpen} 
        onDeleteEvent={onDeleteEvent} 
        compact={true} 
        setSelectedDate={setSelectedDate} 
      />
    </div>
  );
};

export default ResaleDayContent;
