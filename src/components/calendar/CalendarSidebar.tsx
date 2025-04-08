
import React from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface CalendarSidebarProps {
  date: Date;
  handleDateSelect: (selectedDate: Date | undefined) => void;
  className?: string;
}

export const CalendarSidebar: React.FC<CalendarSidebarProps> = ({
  date,
  handleDateSelect,
  className
}) => {
  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle>Calendar</CardTitle>
      </CardHeader>
      <CardContent>
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleDateSelect}
          className="rounded-md border shadow-sm pointer-events-auto"
        />
      </CardContent>
    </Card>
  );
};

export default CalendarSidebar;
