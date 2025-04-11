import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { ResaleEvent } from '@/types/resale-event-types';
import CompactResaleEvent from './components/CompactResaleEvent';
import DetailedResaleEvent from './components/DetailedResaleEvent';
interface ResaleEventListProps {
  events: ResaleEvent[];
  loading: boolean;
  setIsDialogOpen: (isOpen: boolean) => void;
  onDeleteEvent?: (eventId: string) => void;
  compact?: boolean;
  setSelectedDate?: () => void;
}
export const ResaleEventList: React.FC<ResaleEventListProps> = ({
  events,
  loading,
  setIsDialogOpen,
  onDeleteEvent,
  compact = false,
  setSelectedDate
}) => {
  if (loading) {
    return <div className="space-y-2">
        {[1, 2, 3].map(i => <div key={i} className="p-2 rounded-md border animate-pulse bg-muted/50 h-16" />)}
      </div>;
  }
  if (events.length === 0) {
    return <div className="flex flex-col items-center justify-center h-full text-center p-4">
        <p className="text-muted-foreground">No events scheduled for this day.</p>
        
      </div>;
  }
  return <div className={compact ? "space-y-1" : "space-y-3"}>
      {events.map(event => compact ? <CompactResaleEvent key={event.id} event={event} /> : <DetailedResaleEvent key={event.id} event={event} onDeleteEvent={onDeleteEvent} />)}
    </div>;
};
export default ResaleEventList;