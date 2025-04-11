
import React from 'react';
import { Sparkles, Tags } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface MessageContentFieldProps {
  content: string;
  onChange: (content: string) => void;
}

const MessageContentField: React.FC<MessageContentFieldProps> = ({
  content,
  onChange
}) => {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label htmlFor="content" className="block font-medium">Message Content</label>
        <div className="flex gap-2">
          <div className="relative">
            <Select defaultValue="plaintext">
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="plaintext">Plain Text</SelectItem>
                <SelectItem value="html">HTML</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button variant="outline" className="gap-2">
            <Tags className="h-4 w-4" />
            Merge Tags
          </Button>
          <Button variant="outline" className="gap-2">
            <Sparkles className="h-4 w-4" />
            AI Assist
          </Button>
        </div>
      </div>
      <Textarea
        id="content"
        placeholder="Enter your message content here..."
        value={content}
        onChange={(e) => onChange(e.target.value)}
        className="min-h-[300px]"
      />
    </div>
  );
};

export default MessageContentField;
