
import React from 'react';
import PageTemplate from '@/components/layout/PageTemplate';
import { BarChart } from 'lucide-react';

const Operations = () => {
  return <PageTemplate 
    title="Operations" 
    icon={<BarChart className="h-8 w-8" />}
    description="Manage day-to-day operational activities for community associations."
  />;
};

export default Operations;
