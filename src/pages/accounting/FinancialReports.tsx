
import React from 'react';
import PageTemplate from '@/components/layout/PageTemplate';
import { BarChart2 } from 'lucide-react';

const FinancialReports = () => {
  return <PageTemplate 
    title="Financial Reports" 
    icon={<BarChart2 className="h-8 w-8" />}
    description="Generate and view financial statements and reports."
  />;
};

export default FinancialReports;
