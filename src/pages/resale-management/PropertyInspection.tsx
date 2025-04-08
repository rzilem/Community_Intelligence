
import React from 'react';
import PageTemplate from '@/components/layout/PageTemplate';
import { CalendarCheck } from 'lucide-react';

const PropertyInspection = () => {
  return <PageTemplate 
    title="Property Inspection" 
    icon={<CalendarCheck className="h-8 w-8" />}
    description="Schedule and manage property inspections for resale transactions."
  />;
};

export default PropertyInspection;
