
import React from 'react';
import PageTemplate from '@/components/layout/PageTemplate';
import { LineChart } from 'lucide-react';

const Analytics = () => {
  return <PageTemplate 
    title="Analytics" 
    icon={<LineChart className="h-8 w-8" />}
    description="View detailed marketing and lead conversion analytics."
  />;
};

export default Analytics;
