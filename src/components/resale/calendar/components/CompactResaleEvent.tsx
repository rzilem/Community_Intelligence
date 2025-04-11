
import React from 'react';
import { cn } from '@/lib/utils';
import { MapPin } from 'lucide-react';
import { ResaleEvent } from '@/types/resale-event-types';
import ResaleEventTypeBadge from './ResaleEventTypeBadge';
import { getEventBackground } from '../utils/resaleEventUtils';

interface CompactResaleEventProps {
  event: ResaleEvent;
}

export const CompactResaleEvent: React.FC<CompactResaleEventProps> = ({ event }) => {
  return (
    <div
      className={cn(
        "rounded-md border flex flex-col justify-between group relative",
        "border-l-4 p-1 text-xs",
        getEventBackground(event.type)
      )}
    >
      <div className="flex justify-between items-start gap-2">
        <div>
          <h3 className="font-medium text-xs line-clamp-1">
            {event.title}
          </h3>
          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
            {event.startTime}
            {event.property && (
              <span className="truncate max-w-[80px]" title={event.property}>
                • {event.property}
              </span>
            )}
          </div>
        </div>
        <div className="flex-shrink-0">
          <ResaleEventTypeBadge type={event.type} />
        </div>
      </div>
    </div>
  );
};

export default CompactResaleEvent;
