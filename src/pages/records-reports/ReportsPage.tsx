
import React from 'react';
import PageTemplate from '@/components/layout/PageTemplate';
import { FileBarChart }  from 'lucide-react';

const ReportsPage = () => {
  return <PageTemplate 
    title="Reports" 
    icon={<FileBarChart className="h-8 w-8" />}
    description="Generate and view various reports about your communities."
  />;
};

export default ReportsPage;
