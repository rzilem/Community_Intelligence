
import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { MapPin, Trash2 } from 'lucide-react';
import { ResaleEvent } from '@/types/resale-event-types';
import ResaleEventTypeBadge from './ResaleEventTypeBadge';
import ResaleEventStatusBadge from './ResaleEventStatusBadge';
import { getEventIcon, getEventBackground } from '../utils/resaleEventUtils';

interface DetailedResaleEventProps {
  event: ResaleEvent;
  onDeleteEvent?: (eventId: string) => void;
}

export const DetailedResaleEvent: React.FC<DetailedResaleEventProps> = ({ event, onDeleteEvent }) => {
  return (
    <div
      className={cn(
        "rounded-md border flex flex-col justify-between group relative",
        "border-l-4 p-3",
        getEventBackground(event.type)
      )}
    >
      <div className="flex justify-between items-start gap-2">
        <div className="flex items-start gap-2">
          <div className="flex-shrink-0 mt-0.5">
            {getEventIcon(event.type)}
          </div>
          <div>
            <h3 className="font-medium line-clamp-1">
              {event.title}
            </h3>
            
            <div className="flex flex-wrap gap-1 mt-1">
              <ResaleEventTypeBadge type={event.type} />
              <ResaleEventStatusBadge status={event.status} />
            </div>
            
            <p className="text-sm text-muted-foreground mt-1">
              {event.startTime} {event.endTime && `- ${event.endTime}`}
            </p>
            
            {event.description && (
              <p className="text-sm mt-1 text-muted-foreground line-clamp-2">
                {event.description}
              </p>
            )}
            
            {event.property && (
              <p className="text-sm mt-1 flex items-center text-muted-foreground">
                <MapPin className="h-3 w-3 mr-1" />
                {event.property}
              </p>
            )}
          </div>
        </div>
      </div>
      
      {onDeleteEvent && (
        <div className="flex justify-end mt-2">
          <Button 
            variant="ghost" 
            size="icon"
            className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => {
              e.stopPropagation();
              onDeleteEvent(event.id);
            }}
            aria-label="Delete event"
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default DetailedResaleEvent;
