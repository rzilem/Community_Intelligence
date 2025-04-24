
import React from 'react';
import { Printer, Download, Filter, Plus, RefreshCw } from 'lucide-react';
import TooltipButton from '@/components/ui/tooltip-button';

interface PrintQueueActionsProps {
  includeMailingLabels?: boolean;
  setIncludeMailingLabels?: (value: boolean) => void;
  printPreview?: boolean;
  setPrintPreview?: (value: boolean) => void;
  onPrint?: () => void;
  onSendToMailers?: () => void;
  onExport?: () => void;
  selectedJobsCount?: number;
}

const PrintQueueActions: React.FC<PrintQueueActionsProps> = ({
  includeMailingLabels,
  setIncludeMailingLabels,
  printPreview,
  setPrintPreview,
  onPrint,
  onSendToMailers,
  onExport,
  selectedJobsCount
}) => {
  return (
    <div className="flex flex-wrap gap-3 mb-6">
      <TooltipButton 
        variant="outline"
        tooltip="Refresh print queue"
      >
        <RefreshCw className="h-4 w-4 mr-2" /> Refresh
      </TooltipButton>
      
      <TooltipButton 
        variant="outline"
        tooltip="Filter print jobs"
      >
        <Filter className="h-4 w-4 mr-2" /> Filter
      </TooltipButton>
      
      <TooltipButton 
        variant="outline"
        tooltip="Export print queue data"
        onClick={onExport}
      >
        <Download className="h-4 w-4 mr-2" /> Export
      </TooltipButton>
      
      <TooltipButton
        tooltip="Add new print job"
      >
        <Plus className="h-4 w-4 mr-2" /> New Print Job
      </TooltipButton>
      
      <TooltipButton
        variant="default"
        tooltip="Print selected items"
        onClick={onPrint}
        disabled={selectedJobsCount === 0}
      >
        <Printer className="h-4 w-4 mr-2" /> Print Selected
        {selectedJobsCount ? ` (${selectedJobsCount})` : ''}
      </TooltipButton>
    </div>
  );
};

export default PrintQueueActions;
