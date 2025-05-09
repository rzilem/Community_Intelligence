
import React from 'react';
import {
  HelpCircle,
  ExternalLink
} from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

const OpenAIHelp: React.FC = () => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="text-muted-foreground hover:text-foreground">
          <HelpCircle className="h-5 w-5" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4">
        <div className="space-y-2">
          <h4 className="font-medium">OpenAI API Keys</h4>
          <p className="text-sm text-muted-foreground">
            This integration requires an OpenAI API key to enable AI features throughout the application.
          </p>
          <div className="mt-2">
            <a 
              href="https://platform.openai.com/api-keys" 
              target="_blank" 
              rel="noreferrer"
              className="text-sm flex items-center text-blue-600 hover:text-blue-800"
            >
              <ExternalLink className="h-3 w-3 mr-1" />
              Get your OpenAI API key
            </a>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default OpenAIHelp;
