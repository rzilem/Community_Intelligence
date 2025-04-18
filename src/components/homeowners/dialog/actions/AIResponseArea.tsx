
import React from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { RefreshCw, Send, Edit } from 'lucide-react';
import { TooltipButton } from '@/components/ui/tooltip-button';

interface AIResponseAreaProps {
  aiResponse: string;
  setAiResponse: (value: string) => void;
  generateAIResponse: () => Promise<void>;
  onSubmit: (values: any) => void;
  isGenerating: boolean;
  isPending: boolean;
}

const AIResponseArea = ({ 
  aiResponse, 
  setAiResponse, 
  generateAIResponse, 
  onSubmit,
  isGenerating,
  isPending
}: AIResponseAreaProps) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-medium">AI-Generated Response</h4>
        <TooltipButton
          tooltip="Generate an AI-powered professional response"
          onClick={generateAIResponse}
          disabled={isGenerating}
          className="bg-blue-500 hover:bg-blue-600"
          size="sm"
        >
          <RefreshCw className={`h-4 w-4 mr-1 ${isGenerating ? 'animate-spin' : ''}`} />
          {isGenerating ? 'Generating...' : 'Generate Response'}
        </TooltipButton>
      </div>

      <Textarea
        className="min-h-[120px] mb-2 text-sm"
        placeholder="AI-generated response will appear here..."
        value={aiResponse}
        onChange={(e) => setAiResponse(e.target.value)}
      />

      <div className="flex justify-end space-x-2">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => setAiResponse('')}
        >
          <Edit className="h-4 w-4 mr-1" />
          Clear
        </Button>
        <Button 
          className="bg-blue-500 hover:bg-blue-600"
          size="sm"
          disabled={!aiResponse || isPending}
          onClick={() => onSubmit({ response: aiResponse, status: 'responded' })}
        >
          <Send className="h-4 w-4 mr-1" />
          {isPending ? 'Sending...' : 'Approve & Send'}
        </Button>
      </div>
    </div>
  );
};

export default AIResponseArea;
