
import React from 'react';
import { Button } from '@/components/ui/button';

interface PdfLoaderProps {
  onExternalOpen: () => void;
}

export const PdfLoader: React.FC<PdfLoaderProps> = ({ onExternalOpen }) => (
  <div className="absolute inset-0 flex items-center justify-center bg-background/50 z-10">
    <div className="text-center">
      <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
      <p className="text-sm text-muted-foreground">Loading PDF...</p>
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={onExternalOpen}
        className="mt-2 text-xs"
      >
        Or open in new tab
      </Button>
    </div>
  </div>
);
