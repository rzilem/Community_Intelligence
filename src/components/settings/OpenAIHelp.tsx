
import React from 'react';
import {
  HelpCircle,
  ExternalLink
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const OpenAIHelp = () => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button className="inline-flex items-center text-muted-foreground hover:text-primary">
            <HelpCircle className="h-4 w-4" />
          </button>
        </TooltipTrigger>
        <TooltipContent className="w-80 p-4">
          <div className="space-y-2">
            <h4 className="font-medium">OpenAI API Key</h4>
            <p className="text-sm">
              You can find your API key in the OpenAI dashboard under API keys.
            </p>
            <a 
              href="https://platform.openai.com/api-keys" 
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-sm text-blue-500 hover:underline"
            >
              Go to OpenAI Dashboard
              <ExternalLink className="ml-1 h-3 w-3" />
            </a>
            <div className="pt-2">
              <h4 className="font-medium">Model Selection</h4>
              <p className="text-sm mt-1">
                • GPT-4o Mini - Less expensive, faster responses<br />
                • GPT-4o - More powerful, better reasoning
              </p>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default OpenAIHelp;
