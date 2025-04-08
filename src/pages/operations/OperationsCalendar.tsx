
import React from 'react';
import PageTemplate from '@/components/layout/PageTemplate';
import { Calendar } from 'lucide-react';
import { CalendarView } from '@/components/calendar/CalendarView';

const OperationsCalendar = () => {
  return (
    <PageTemplate 
      title="Operations Calendar" 
      icon={<Calendar className="h-8 w-8" />}
      description="Schedule and manage operational activities and events."
    >
      <CalendarView />
    </PageTemplate>
  );
};

export default OperationsCalendar;
