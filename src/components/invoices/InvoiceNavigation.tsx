
import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Minimize2, Maximize2 } from 'lucide-react';

export interface InvoiceNavigationProps {
  isNewInvoice: boolean;
  showPreview: boolean;
  onTogglePreview: () => void;
  onNavigate: (direction: 'next' | 'prev') => void;
  disableNavigation: boolean;
  currentPosition?: number;
  totalPending?: number;
}

export const InvoiceNavigation: React.FC<InvoiceNavigationProps> = ({
  isNewInvoice,
  showPreview,
  onTogglePreview,
  onNavigate,
  disableNavigation,
  currentPosition,
  totalPending
}) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex gap-2 items-center">
        {!isNewInvoice && (
          <>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onNavigate('prev')}
              disabled={disableNavigation}
              title="Navigate to previous pending invoice"
            >
              <ChevronLeft className="h-4 w-4 mr-1" /> Previous Pending
            </Button>

            {currentPosition !== undefined && totalPending !== undefined && (
              <span className="text-sm text-muted-foreground px-2">
                {currentPosition} of {totalPending} Pending
              </span>
            )}

            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onNavigate('next')}
              disabled={disableNavigation}
              title="Navigate to next pending invoice"
            >
              Next Pending <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </>
        )}
      </div>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={onTogglePreview}
        className="gap-1"
      >
        {showPreview ? (
          <><Minimize2 className="h-4 w-4" /> Hide Preview</>
        ) : (
          <><Maximize2 className="h-4 w-4" /> Show Preview</>
        )}
      </Button>
    </div>
  );
};

