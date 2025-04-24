
import React from 'react';
import { Filter, Download, FileText } from 'lucide-react';
import TooltipButton from '@/components/ui/tooltip-button';
import { useNavigate } from 'react-router-dom';

const FinancialReportToolbar: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-wrap gap-3 mb-6">
      <TooltipButton 
        variant="outline"
        tooltip="Filter financial reports"
      >
        <Filter className="h-4 w-4 mr-2" /> Filter
      </TooltipButton>
      <TooltipButton 
        variant="outline"
        tooltip="Export financial report data"
      >
        <Download className="h-4 w-4 mr-2" /> Export
      </TooltipButton>
      <TooltipButton 
        onClick={() => navigate('/records-reports/reports')}
        tooltip="View all financial reports"
      >
        <FileText className="h-4 w-4 mr-2" /> All Reports
      </TooltipButton>
    </div>
  );
};

export default FinancialReportToolbar;
