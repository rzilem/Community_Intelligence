
import React from 'react';
import PageTemplate from './PageTemplate';
import { LineChart } from 'lucide-react';

const Reports = () => {
  return <PageTemplate title="Reports" icon={<LineChart className="h-8 w-8" />} />;
};

export default Reports;
