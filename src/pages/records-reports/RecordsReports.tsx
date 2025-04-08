
import React from 'react';
import PageTemplate from '@/components/layout/PageTemplate';
import { FileText } from 'lucide-react';

const RecordsReports = () => {
  return <PageTemplate 
    title="Records & Reports" 
    icon={<FileText className="h-8 w-8" />}
    description="Access and manage community records and generate reports."
  />;
};

export default RecordsReports;
