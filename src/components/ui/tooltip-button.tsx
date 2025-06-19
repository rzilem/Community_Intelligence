
import React from 'react';
import { Button, ButtonProps } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { SafeTooltipProvider } from '@/components/ui/safe-tooltip-provider';

interface TooltipButtonProps extends ButtonProps {
  tooltip: string;
  children: React.ReactNode;
  side?: 'top' | 'right' | 'bottom' | 'left';
}

const TooltipButton: React.FC<TooltipButtonProps> = ({ 
  tooltip, 
  children, 
  side = 'top',
  ...buttonProps 
}) => {
  return (
    <SafeTooltipProvider>
      <Tooltip delayDuration={300}>
        <TooltipTrigger asChild>
          <Button {...buttonProps}>
            {children}
          </Button>
        </TooltipTrigger>
        <TooltipContent side={side}>
          {tooltip}
        </TooltipContent>
      </Tooltip>
    </SafeTooltipProvider>
  );
};

export default TooltipButton;
