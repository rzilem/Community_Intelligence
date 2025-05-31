
import React from 'react';
import PageTemplate from '@/components/layout/PageTemplate';
import { Calendar } from 'lucide-react';
import { CalendarView } from '@/components/calendar/CalendarView';

const CalendarPage = () => {
  return (
    <PageTemplate 
      title="Calendar" 
      icon={<Calendar className="h-8 w-8" />}
      description="Schedule and manage HOA events and amenity bookings."
    >
      <CalendarView />
    </PageTemplate>
  );
};

export default CalendarPage;
