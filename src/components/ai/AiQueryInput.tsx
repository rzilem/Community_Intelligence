
import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useAiAssistant } from '@/hooks/ai/useAiAssistant';
import ReactMarkdown from 'react-markdown';

interface AiQueryInputProps {
  onQuery?: (query: string) => Promise<void>;
  placeholder?: string;
  className?: string;
  compact?: boolean;
}

export const AiQueryInput: React.FC<AiQueryInputProps> = ({
  placeholder = "Ask Community Intelligence anything...",
  className,
  compact = false,
}) => {
  const [query, setQuery] = useState<string>('');
  const { askAi, response, isLoading, error, clearResponse } = useAiAssistant();
  const responseRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    await askAi(query);
  };

  useEffect(() => {
    if (response && responseRef.current) {
      responseRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [response]);

  const handleNewQuestion = () => {
    clearResponse();
    setQuery('');
    // Focus on the input field
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  if (compact) {
    return (
      <form onSubmit={handleSubmit} className={cn("relative flex items-center w-full", className)}>
        <Sparkles size={18} className="absolute left-3 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="flex h-10 w-full rounded-md border border-input bg-background pl-10 pr-12 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          disabled={isLoading}
          ref={inputRef as any}
        />
        <Button 
          type="submit"
          size="icon"
          variant="ghost"
          className="absolute right-1 h-8 w-8"
          disabled={isLoading || !query.trim()}
        >
          {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
        </Button>
      </form>
    );
  }

  return (
    <Card className={cn("p-4 border border-border", className)}>
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Sparkles size={16} className="text-hoa-blue" />
          <span className="ai-gradient-text">Community Intelligence AI</span>
        </div>
        
        {response ? (
          <div className="space-y-4">
            <div className="bg-muted/40 p-4 rounded-md">
              <p className="font-medium text-sm">Your question:</p>
              <p className="text-sm">{query}</p>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-md" ref={responseRef}>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles size={14} className="text-hoa-blue" />
                <p className="font-medium text-sm">AI Response:</p>
              </div>
              <div className="prose prose-sm max-w-none">
                <ReactMarkdown>{response}</ReactMarkdown>
              </div>
            </div>
            
            <div className="flex justify-end">
              <Button
                onClick={handleNewQuestion}
                className="bg-gradient-to-r from-hoa-blue to-hoa-teal hover:opacity-90"
              >
                <RefreshCw size={16} className="mr-2" />
                Ask New Question
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={placeholder}
              className="min-h-24 focus-visible:ring-hoa-blue-200"
              disabled={isLoading}
              ref={inputRef}
            />
            
            <div className="flex justify-end">
              <Button 
                type="submit"
                disabled={isLoading || !query.trim()}
                className="bg-gradient-to-r from-hoa-blue to-hoa-teal hover:opacity-90"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={16} className="mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Sparkles size={16} className="mr-2" />
                    Ask AI
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
        
        {error && (
          <div className="text-sm text-red-500 p-2 bg-red-50 rounded-md">
            Error: {error}
          </div>
        )}
      </div>
    </Card>
  );
};

export default AiQueryInput;
