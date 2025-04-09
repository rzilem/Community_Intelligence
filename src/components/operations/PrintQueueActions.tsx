
import React from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Printer, Eye, Send, Download } from 'lucide-react';

interface PrintQueueActionsProps {
  includeMailingLabels: boolean;
  setIncludeMailingLabels: (include: boolean) => void;
  printPreview: boolean;
  setPrintPreview: (preview: boolean) => void;
  onPrint: () => void;
  onSendToMailers: () => void;
  onExport: () => void;
  selectedJobsCount: number;
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
    <div className="flex flex-wrap gap-4 py-4">
      <div className="flex items-center space-x-2">
        <Checkbox
          id="include-mailing-labels"
          checked={includeMailingLabels}
          onCheckedChange={(checked) => setIncludeMailingLabels(!!checked)}
        />
        <label
          htmlFor="include-mailing-labels"
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          Include Mailing Labels
        </label>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="print-preview"
          checked={printPreview}
          onCheckedChange={(checked) => setPrintPreview(!!checked)}
        />
        <label
          htmlFor="print-preview"
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          Print Preview
        </label>
      </div>

      <Button
        variant="outline"
        className="ml-auto"
        disabled={selectedJobsCount === 0}
        onClick={onPrint}
      >
        <Printer className="mr-2 h-4 w-4" /> Print
      </Button>
      
      <Button
        variant="outline"
        disabled={selectedJobsCount === 0}
        onClick={onSendToMailers}
      >
        <Send className="mr-2 h-4 w-4" /> Send to HOA Mailers
      </Button>

      <Button
        variant="outline"
        disabled={selectedJobsCount === 0}
        onClick={onExport}
      >
        <Download className="mr-2 h-4 w-4" /> Export
      </Button>
    </div>
  );
};

export default PrintQueueActions;
