
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { FileText, AlertTriangle } from 'lucide-react';
import { MessageFormFieldProps } from '@/types/message-form-types';
import { cn } from '@/lib/utils';

interface MessageSubjectProps extends MessageFormFieldProps {
  onUseTemplate: () => void;
}

export const MessageSubject: React.FC<MessageSubjectProps> = ({
  value,
  onChange,
  error,
  onUseTemplate
}) => {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label htmlFor="subject" className="block font-medium">Subject</label>
        <Button 
          variant="outline" 
          className="gap-2"
          onClick={onUseTemplate}
        >
          <FileText className="h-4 w-4" />
          Use Template
        </Button>
      </div>
      <div className="relative">
        <Input 
          id="subject"
          placeholder="Enter message subject"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cn("pr-10", error && "border-red-500")}
        />
        {!value && (
          <AlertTriangle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-amber-500" />
        )}
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
};
