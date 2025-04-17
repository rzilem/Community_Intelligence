
import React from 'react';
import { 
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
} from '@/components/ui/responsive-dialog';
import { X } from 'lucide-react';

interface RequestDialogHeaderProps {
  title: string;
  trackingNumber?: string;
  onClose: () => void;
}

const RequestDialogHeader: React.FC<RequestDialogHeaderProps> = ({
  title,
  trackingNumber,
  onClose,
}) => {
  return (
    <ResponsiveDialogHeader className="flex items-start justify-between p-6 pb-2 relative">
      <button
        onClick={onClose}
        className="absolute left-2 top-2 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
      >
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </button>
      
      <div className="flex flex-col gap-1 ml-8">
        <ResponsiveDialogTitle className="text-xl">
          Edit Request: {title}
        </ResponsiveDialogTitle>
        <div className="text-sm text-muted-foreground">
          Tracking #: {trackingNumber}
        </div>
      </div>
    </ResponsiveDialogHeader>
  );
};

export default RequestDialogHeader;
