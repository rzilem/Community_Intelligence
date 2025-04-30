
import React from 'react';
import { DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Minimize2, Maximize2 } from 'lucide-react';

interface HomeownerRequestDialogHeaderProps {
  title: string;
  showFullscreenButton?: boolean;
  isFullscreen?: boolean;
  onFullscreenToggle?: () => void;
}

const HomeownerRequestDialogHeader: React.FC<HomeownerRequestDialogHeaderProps> = ({
  title,
  showFullscreenButton,
  isFullscreen,
  onFullscreenToggle
}) => {
  return (
    <DialogHeader>
      <DialogTitle className="flex justify-between items-center">
        <span>Request Details: {title}</span>
        {showFullscreenButton && onFullscreenToggle && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onFullscreenToggle}
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          </Button>
        )}
      </DialogTitle>
    </DialogHeader>
  );
};

export default HomeownerRequestDialogHeader;
