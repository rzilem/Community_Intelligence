
import React from 'react';
import { Button } from '@/components/ui/button';
import { MessageTypeButtonProps } from '@/types/message-form-types';
import { cn } from '@/lib/utils';

export const MessageTypeButton: React.FC<MessageTypeButtonProps> = ({
  type,
  isSelected,
  onSelect,
  icon: Icon,
  label,
  className: additionalClassName
}) => {
  return (
    <Button 
      type="button"
      variant={isSelected ? 'default' : 'outline'}
      className={cn(
        'flex-1 gap-2',
        isSelected && type === 'email' && 'bg-blue-600 hover:bg-blue-700',
        additionalClassName
      )}
      onClick={onSelect}
    >
      <Icon className="h-5 w-5" />
      {label}
    </Button>
  );
};
