
import React from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle, Circle } from 'lucide-react';

interface StepStatusButtonProps {
  isComplete: boolean;
  isDisabled: boolean;
  onClick: () => void;
}

export const StepStatusButton: React.FC<StepStatusButtonProps> = ({
  isComplete,
  isDisabled,
  onClick
}) => (
  <Button 
    variant="ghost" 
    size="sm" 
    className="rounded-full p-0 w-8 h-8"
    disabled={isDisabled}
    onClick={onClick}
  >
    {isComplete ? (
      <CheckCircle className="h-6 w-6 text-green-500" />
    ) : (
      <Circle className="h-6 w-6 text-gray-400" />
    )}
  </Button>
);
