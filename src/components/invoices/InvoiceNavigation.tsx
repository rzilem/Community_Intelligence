
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
  // Create separate handler functions to prevent default behavior
  const handlePrevious = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    onNavigate('prev');
  };
  
  const handleNext = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    onNavigate('next');
  };

  // Create separate handler for toggle preview to prevent any potential issues
  const handleTogglePreview = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    onTogglePreview();
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex gap-2 items-center">
        {!isNewInvoice && (
          <>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handlePrevious}
              disabled={disableNavigation}
              title="Navigate to previous pending invoice"
              type="button"
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
              onClick={handleNext}
              disabled={disableNavigation}
              title="Navigate to next pending invoice"
              type="button"
            >
              Next Pending <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </>
        )}
      </div>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={handleTogglePreview}
        className="gap-1"
        type="button"
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
