
import React from 'react';
import PageTemplate from '@/components/layout/PageTemplate';
import { Download } from 'lucide-react';

const DataImportExport = () => {
  return <PageTemplate 
    title="Data Import & Export" 
    icon={<Download className="h-8 w-8" />}
    description="Import and export data to and from the system."
  />;
};

export default DataImportExport;
