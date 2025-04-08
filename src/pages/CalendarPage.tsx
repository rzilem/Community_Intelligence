
import React from 'react';
import PageTemplate from './PageTemplate';
import { Calendar } from 'lucide-react';

const CalendarPage = () => {
  return <PageTemplate title="Calendar" icon={<Calendar className="h-8 w-8" />} />;
};

export default CalendarPage;
