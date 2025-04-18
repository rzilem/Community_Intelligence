
import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Minimize2, Maximize2 } from 'lucide-react';

export interface InvoiceNavigationProps {
  isNewInvoice: boolean;
  showPreview: boolean;
  onTogglePreview: () => void;
  onNavigate: (direction: 'next' | 'prev') => void;
  disableNavigation: boolean;
}

export const InvoiceNavigation: React.FC<InvoiceNavigationProps> = ({
  isNewInvoice,
  showPreview,
  onTogglePreview,
  onNavigate,
  disableNavigation
}) => {
  return (
    <div className="flex items-center justify-between"> {/* Changed from space-between to items-center */}
      <div className="flex gap-2">
        {!isNewInvoice && (
          <>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onNavigate('prev')}
              disabled={disableNavigation}
            >
              <ChevronLeft className="h-4 w-4 mr-1" /> Previous
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onNavigate('next')}
              disabled={disableNavigation}
            >
              Next <ChevronRight className="h-4 w-4 ml-1" />
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
