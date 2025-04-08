
import React from 'react';
import PageTemplate from '@/components/layout/PageTemplate';
import { BarChart } from 'lucide-react';

const AccountingDashboard = () => {
  return <PageTemplate 
    title="Accounting Dashboard" 
    icon={<BarChart className="h-8 w-8" />}
    description="Overview of financial metrics and performance for your communities."
  />;
};

export default AccountingDashboard;
