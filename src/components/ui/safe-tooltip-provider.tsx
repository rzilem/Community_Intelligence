
import React, { ReactNode } from 'react';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';

interface SafeTooltipProviderProps {
  children: ReactNode;
  delayDuration?: number;
  skipDelayDuration?: number;
  disableHoverableContent?: boolean;
}

export function SafeTooltipProvider({ 
  children, 
  delayDuration = 700,
  skipDelayDuration = 300,
  disableHoverableContent = false
}: SafeTooltipProviderProps) {
  try {
    return (
      <TooltipPrimitive.Provider
        delayDuration={delayDuration}
        skipDelayDuration={skipDelayDuration}
        disableHoverableContent={disableHoverableContent}
      >
        {children}
      </TooltipPrimitive.Provider>
    );
  } catch (error) {
    console.error('TooltipProvider error (falling back to no provider):', error);
    // Fallback: render children without tooltip provider
    return <>{children}</>;
  }
}
