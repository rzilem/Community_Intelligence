
import React from 'react';
import PageTemplate from '@/components/layout/PageTemplate';
import { Calendar } from 'lucide-react';

const OperationsCalendar = () => {
  return <PageTemplate 
    title="Operations Calendar" 
    icon={<Calendar className="h-8 w-8" />}
    description="Schedule and manage operational activities and events."
  />;
};

export default OperationsCalendar;
