
import React from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { RefreshCw, Send, Edit } from 'lucide-react';

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
    <div className="space-y-2">
      <div className="flex items-center space-x-2 mb-4">
        <Button
          onClick={generateAIResponse}
          disabled={isGenerating}
          className="bg-blue-500 hover:bg-blue-600"
        >
          <RefreshCw className={`${isGenerating ? 'animate-spin' : ''}`} />
          {isGenerating ? 'Generating...' : 'Generate AI Response'}
        </Button>
      </div>

      <Textarea
        className="min-h-[120px] mb-4"
        placeholder="AI-generated response will appear here..."
        value={aiResponse}
        onChange={(e) => setAiResponse(e.target.value)}
      />

      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={() => setAiResponse('')}>
          <Edit className="mr-2" />
          Edit Manually
        </Button>
        <Button 
          className="bg-blue-500 hover:bg-blue-600" 
          disabled={!aiResponse || isPending}
          onClick={() => onSubmit({ response: aiResponse, status: 'responded' })}
        >
          <Send className="mr-2" />
          {isPending ? 'Sending...' : 'Approve & Send'}
        </Button>
      </div>
    </div>
  );
};

export default AIResponseArea;
