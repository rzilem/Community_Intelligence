
import React from 'react';
import { ClipboardList, RefreshCw, DownloadCloud, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { HomeownerRequestForm } from '@/components/homeowners/HomeownerRequestForm';
import TooltipButton from '@/components/ui/tooltip-button';

interface HomeownerRequestsHeaderProps {
  onRefresh: () => void;
  onExport: () => void;
  open: boolean;
  setOpen: (open: boolean) => void;
  onSuccess: () => void;
}

const HomeownerRequestsHeader: React.FC<HomeownerRequestsHeaderProps> = ({
  onRefresh,
  onExport,
  open,
  setOpen,
  onSuccess
}) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <ClipboardList className="h-8 w-8" />
        <h1 className="text-3xl font-bold tracking-tight">Homeowner Request Queue</h1>
      </div>
      <div className="flex items-center gap-2">
        <TooltipButton 
          variant="outline" 
          onClick={onRefresh}
          tooltip="Refresh Requests"
        >
          <RefreshCw className="h-4 w-4 mr-2" /> Refresh
        </TooltipButton>
        
        <TooltipButton 
          variant="outline" 
          onClick={onExport}
          tooltip="Export Requests"
        >
          <DownloadCloud className="h-4 w-4 mr-2" /> Export
        </TooltipButton>
        
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <TooltipButton tooltip="Create New Request">
              <Plus className="h-4 w-4 mr-2" /> New Request
            </TooltipButton>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Create New Request</DialogTitle>
            </DialogHeader>
            <HomeownerRequestForm onSuccess={onSuccess} />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default HomeownerRequestsHeader;
