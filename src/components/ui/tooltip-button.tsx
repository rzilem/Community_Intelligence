
import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ButtonProps } from '@radix-ui/react-button';

interface TooltipButtonProps extends ButtonProps {
  children: React.ReactNode;
  tooltip: string;
  tooltipSide?: 'top' | 'right' | 'bottom' | 'left';
  className?: string;
}

export const TooltipButton: React.FC<TooltipButtonProps> = ({
  children,
  tooltip,
  tooltipSide = 'top',
  className,
  ...props
}) => {
  return (
    <TooltipProvider>
      <Tooltip delayDuration={300}>
        <TooltipTrigger asChild>
          <Button className={cn(className)} {...props}>
            {children}
          </Button>
        </TooltipTrigger>
        <TooltipContent side={tooltipSide}>
          <p>{tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default TooltipButton;
