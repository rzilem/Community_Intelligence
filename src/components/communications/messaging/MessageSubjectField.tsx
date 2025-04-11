
import React from 'react';
import { AlertTriangle, FileText } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface MessageSubjectFieldProps {
  subject: string;
  onChange: (subject: string) => void;
  onUseTemplate: () => void;
}

const MessageSubjectField: React.FC<MessageSubjectFieldProps> = ({
  subject,
  onChange,
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
          value={subject}
          onChange={(e) => onChange(e.target.value)}
          className="pr-10"
        />
        {!subject && (
          <AlertTriangle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-amber-500" />
        )}
      </div>
    </div>
  );
};

export default MessageSubjectField;
