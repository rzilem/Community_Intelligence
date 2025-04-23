
import React from 'react';
import { Textarea } from '@/components/ui/textarea';
import { MessageFormFieldProps } from '@/types/message-form-types';
import { cn } from '@/lib/utils';

export const MessageContent: React.FC<MessageFormFieldProps> = ({
  value,
  onChange,
  error
}) => {
  return (
    <div className="space-y-2">
      <label htmlFor="content" className="block font-medium">Message Content</label>
      <Textarea
        id="content"
        placeholder="Enter your message content..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn("min-h-[200px]", error && "border-red-500")}
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
};
