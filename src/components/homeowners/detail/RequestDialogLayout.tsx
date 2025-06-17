
import React from 'react';
import { Dialog, DialogContent, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import HomeownerRequestDialogHeader from './HomeownerRequestDialogHeader';

interface RequestDialogLayoutProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  showFullscreenButton: boolean;
  isFullscreen: boolean;
  onFullscreenToggle: () => void;
  children: React.ReactNode;
}

const RequestDialogLayout: React.FC<RequestDialogLayoutProps> = ({
  open,
  onOpenChange,
  title,
  showFullscreenButton,
  isFullscreen,
  onFullscreenToggle,
  children
}) => {
  const handleClose = () => {
    onOpenChange(false);
  };

  return (
    <Dialog 
      open={open} 
      onOpenChange={onOpenChange}
      modal={!isFullscreen}
    >
      <DialogContent className={`
        ${isFullscreen ? 'max-w-full h-screen m-0 rounded-none' : 'max-w-4xl h-[90vh]'} 
        overflow-hidden flex flex-col gap-4
      `}>
        <HomeownerRequestDialogHeader 
          title={title}
          showFullscreenButton={showFullscreenButton}
          isFullscreen={isFullscreen}
          onFullscreenToggle={onFullscreenToggle}
        />
        
        {children}
        
        <DialogFooter>
          <Button onClick={handleClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RequestDialogLayout;
