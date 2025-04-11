
import React, { useState } from 'react';
import { Sparkles, Tags } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import MergeTagsPopover from './MergeTagsPopover';

interface MessageContentFieldProps {
  content: string;
  onChange: (content: string) => void;
}

const MessageContentField: React.FC<MessageContentFieldProps> = ({
  content,
  onChange
}) => {
  const [openMergeTags, setOpenMergeTags] = useState(false);
  
  const handleInsertMergeTag = (tag: string) => {
    // Get cursor position
    const textarea = document.getElementById('message-content') as HTMLTextAreaElement;
    const cursorPos = textarea?.selectionStart || content.length;
    
    // Insert tag at cursor position
    const newContent = content.substring(0, cursorPos) + tag + content.substring(cursorPos);
    onChange(newContent);
    
    // Close popover after selection
    setOpenMergeTags(false);
    
    // Focus textarea and set cursor position after the inserted tag
    setTimeout(() => {
      textarea?.focus();
      const newPosition = cursorPos + tag.length;
      textarea?.setSelectionRange(newPosition, newPosition);
    }, 0);
  };
  
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
          <Popover open={openMergeTags} onOpenChange={setOpenMergeTags}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Tags className="h-4 w-4" />
                Merge Tags
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[400px] p-0" align="end">
              <MergeTagsPopover onSelectTag={handleInsertMergeTag} />
            </PopoverContent>
          </Popover>
          <Button variant="outline" className="gap-2">
            <Sparkles className="h-4 w-4" />
            AI Assist
          </Button>
        </div>
      </div>
      <Textarea
        id="message-content"
        placeholder="Enter your message content here..."
        value={content}
        onChange={(e) => onChange(e.target.value)}
        className="min-h-[300px]"
      />
      {content.includes('{') && (
        <div className="mt-2 p-3 bg-muted rounded-md text-sm">
          <p className="font-medium mb-1">Your message contains merge tags:</p>
          <p className="text-muted-foreground">
            Merge tags will be replaced with actual data when the message is sent. 
            For example, {'{resident.full_name}'} will be replaced with the recipient's name.
          </p>
        </div>
      )}
    </div>
  );
};

export default MessageContentField;
