
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
      <Tooltip delayDuration={300}>
        <TooltipTrigger asChild>
          <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
        </TooltipTrigger>
        <TooltipContent className="max-w-sm" side="left">
          <div className="space-y-2">
            <p>
              OpenAI integration powers AI features throughout the application, including:
            </p>
            <ul className="list-disc pl-4 text-sm">
              <li>Homeowner request analysis</li>
              <li>Invoice data extraction</li>
              <li>Lead information analysis</li>
              <li>AI-powered document analysis</li>
            </ul>
            <p className="text-xs mt-2 text-muted-foreground">
              Requires an OpenAI API key from <a href="https://platform.openai.com/api-keys" target="_blank" rel="noreferrer" className="underline hover:text-primary">platform.openai.com/api-keys</a>
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default OpenAIHelp;
