
import React from 'react';
import PageTemplate from '@/components/layout/PageTemplate';
import { BarChart } from 'lucide-react';

const OperationsDashboard = () => {
  return <PageTemplate 
    title="Operations Dashboard" 
    icon={<BarChart className="h-8 w-8" />}
    description="Overview of operational metrics and activities."
  />;
};

export default OperationsDashboard;
