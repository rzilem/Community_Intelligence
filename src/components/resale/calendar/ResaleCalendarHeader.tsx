
import React from 'react';
import { format, addWeeks, subWeeks } from 'date-fns';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { CardHeader, CardTitle } from '@/components/ui/card';

interface ResaleCalendarHeaderProps {
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
}

const ResaleCalendarHeader: React.FC<ResaleCalendarHeaderProps> = ({
  selectedDate,
  setSelectedDate,
}) => {
  const nextWeek = () => {
    setSelectedDate(addWeeks(selectedDate, 1));
  };

  const prevWeek = () => {
    setSelectedDate(subWeeks(selectedDate, 1));
  };

  return (
    <CardHeader className="pb-2 flex flex-row items-center justify-between">
      <CardTitle>
        {format(selectedDate, 'MMM d')} - {format(addWeeks(selectedDate, 1), 'MMM d, yyyy')}
      </CardTitle>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" onClick={prevWeek}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="sm" onClick={() => setSelectedDate(new Date())}>
          Today
        </Button>
        <Button variant="outline" size="icon" onClick={nextWeek}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </CardHeader>
  );
};

export default ResaleCalendarHeader;
