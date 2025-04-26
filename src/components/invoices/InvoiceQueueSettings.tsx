
import React from 'react';
import { Settings2, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ColumnSettings } from '@/components/ui/column-settings';
import { 
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent
} from '@/components/ui/dropdown-menu';

interface InvoiceQueueSettingsProps {
  columns: any[];
  visibleColumnIds: string[];
  updateVisibleColumns: (columns: string[]) => void;
  resetToDefaults: () => void;
  refreshInvoices: () => void;
  autoRefreshEnabled: boolean;
  toggleAutoRefresh: () => void;
}

export const InvoiceQueueSettings: React.FC<InvoiceQueueSettingsProps> = ({
  columns,
  visibleColumnIds,
  updateVisibleColumns,
  resetToDefaults,
  refreshInvoices,
  autoRefreshEnabled,
  toggleAutoRefresh,
}) => {
  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon">
            <Settings2 className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="p-4 space-y-2 min-w-[220px]">
          <h4 className="text-sm font-medium mb-2">Display Options</h4>
          <div className="flex items-center justify-between">
            <Label htmlFor="auto-refresh" className="text-sm">Auto Refresh</Label>
            <Switch 
              id="auto-refresh" 
              checked={autoRefreshEnabled} 
              onCheckedChange={toggleAutoRefresh} 
            />
          </div>
          <ColumnSettings
            columns={columns}
            visibleColumnIds={visibleColumnIds}
            onColumnChange={updateVisibleColumns}
            onReset={resetToDefaults}
          />
        </DropdownMenuContent>
      </DropdownMenu>
      
      <Button 
        onClick={refreshInvoices} 
        variant="outline" 
        size="icon" 
        aria-label="Refresh Invoices"
        title="Refresh Invoices"
      >
        <RefreshCcw className="h-4 w-4" />
      </Button>
    </div>
  );
};

