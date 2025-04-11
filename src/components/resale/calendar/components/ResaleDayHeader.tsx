
import React from 'react';
import { format, isToday } from 'date-fns';
import { cn } from '@/lib/utils';

interface ResaleDayHeaderProps {
  date: Date;
}

const ResaleDayHeader: React.FC<ResaleDayHeaderProps> = ({ date }) => {
  return (
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
  );
};

export default ResaleDayHeader;
