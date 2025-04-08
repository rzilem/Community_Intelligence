
import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { ButtonProps as RadixButtonProps } from '@/components/ui/button';

interface TooltipButtonProps extends Omit<RadixButtonProps, 'asChild'> {
  children: React.ReactNode;
  tooltip: string;
  tooltipSide?: 'top' | 'right' | 'bottom' | 'left';
  className?: string;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
}

export const TooltipButton: React.FC<TooltipButtonProps> = ({
  children,
  tooltip,
  tooltipSide = 'top',
  className,
  variant = "default",
  ...props
}) => {
  return (
    <Tooltip delayDuration={300}>
      <TooltipTrigger asChild>
        <Button className={cn(className)} variant={variant} {...props}>
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent side={tooltipSide}>
        <p>{tooltip}</p>
      </TooltipContent>
    </Tooltip>
  );
};

export default TooltipButton;
