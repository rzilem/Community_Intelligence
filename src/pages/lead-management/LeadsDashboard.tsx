
import React from 'react';
import PageTemplate from '@/components/layout/PageTemplate';
import { BarChart } from 'lucide-react';

const LeadsDashboard = () => {
  return <PageTemplate 
    title="Leads Dashboard" 
    icon={<BarChart className="h-8 w-8" />}
    description="Overview of lead generation and conversion metrics."
  />;
};

export default LeadsDashboard;
