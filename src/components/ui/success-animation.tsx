
import React, { useEffect, useState } from 'react';
import { Check, PartyPopper } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SuccessAnimationProps {
  className?: string;
  duration?: number;
  onComplete?: () => void;
  variant?: 'check' | 'confetti';
  text?: string;
}

export const SuccessAnimation: React.FC<SuccessAnimationProps> = ({
  className,
  duration = 2000,
  onComplete,
  variant = 'check',
  text = 'Success!'
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      if (onComplete) onComplete();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onComplete]);

  if (!isVisible) return null;

  return (
    <div className={cn(
      "fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-50 animate-enter",
      className
    )}>
      <div className="flex flex-col items-center gap-4 p-6 rounded-lg bg-background border shadow-lg animate-scale-in">
        <div className="relative flex items-center justify-center">
          <div className="absolute inset-0 bg-green-100 rounded-full scale-[1.7] animate-pulse" />
          <div className="relative z-10 bg-green-500 text-white rounded-full p-3">
            {variant === 'check' ? (
              <Check className="h-10 w-10" />
            ) : (
              <PartyPopper className="h-10 w-10" />
            )}
          </div>
        </div>
        <p className="text-xl font-medium">{text}</p>
      </div>
    </div>
  );
};

export default SuccessAnimation;
