
import React from 'react';
import { HelpCircle } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const OpenAIHelp: React.FC = () => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
        </TooltipTrigger>
        <TooltipContent className="max-w-md">
          <div className="space-y-2">
            <p>OpenAI is used to power AI features throughout the platform, including:</p>
            <ul className="list-disc pl-4 text-sm">
              <li>AI-assisted form field suggestions</li>
              <li>Automated content generation</li>
              <li>Email template generation</li>
              <li>Invoice analysis</li>
              <li>Document summarization</li>
            </ul>
            <p className="text-xs text-muted-foreground pt-1">
              Your API key is stored securely and used only for the features you enable.
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default OpenAIHelp;
