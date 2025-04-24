import React from 'react';
import PageTemplate from '@/components/layout/PageTemplate';
import { FileText, Download, Filter, Plus } from 'lucide-react';
import TooltipButton from '@/components/ui/tooltip-button';

const ReportsPage = () => {
  return (
    <PageTemplate
      title="Reports"
      icon={<FileText className="h-6 w-6" />}
      description="View and manage reports"
    >
      <div className="flex flex-wrap gap-3 mb-6">
        <TooltipButton 
          variant="outline"
          tooltip="Filter report list"
        >
          <Filter className="h-4 w-4 mr-2" /> Filter
        </TooltipButton>
        
        <TooltipButton 
          variant="outline"
          tooltip="Export reports data"
        >
          <Download className="h-4 w-4 mr-2" /> Export
        </TooltipButton>
        
        <TooltipButton 
          tooltip="Create new report"
        >
          <Plus className="h-4 w-4 mr-2" /> New Report
        </TooltipButton>
      </div>
      
      <div className="grid gap-4">
        {/* Report cards or table */}
      </div>
    </PageTemplate>
  );
};

export default ReportsPage;
