
import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import PageTemplate from '@/components/layout/PageTemplate';
import { Calendar } from 'lucide-react';
import { CalendarView } from '@/components/calendar/CalendarView';

const CalendarPage = () => {
  return (
    <AppLayout>
      <PageTemplate 
        title="Calendar" 
        icon={<Calendar className="h-8 w-8" />}
        description="Schedule and manage HOA events and amenity bookings."
      >
        <CalendarView />
      </PageTemplate>
    </AppLayout>
  );
};

export default CalendarPage;
