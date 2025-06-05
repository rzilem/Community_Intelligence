
import React, { useState } from 'react';
import { Sparkles, Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface AiQueryInputProps {
  onQuery?: (query: string) => Promise<void>;
  placeholder?: string;
  className?: string;
  compact?: boolean;
  streaming?: boolean;
}

export const AiQueryInput: React.FC<AiQueryInputProps> = ({
  onQuery,
  placeholder = "Ask Community Intelligence anything...",
  className,
  compact = false,
  streaming = false,
}) => {
  const [query, setQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [answer, setAnswer] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    setIsLoading(true);

    try {
      if (onQuery) {
        await onQuery(query);
        setQuery('');
        return;
      }

      setAnswer('');
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-query`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query, stream: streaming })
        }
      );

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to get AI response');
      }

      if (streaming && response.body) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let done = false;
        while (!done) {
          const { value, done: doneReading } = await reader.read();
          done = doneReading;
          const chunkValue = decoder.decode(value);
          setAnswer(prev => prev + chunkValue);
        }
      } else {
        const data = await response.json();
        setAnswer(data.answer || '');
      }
      setQuery('');
    } catch (error) {
      console.error('Error processing AI query:', error);
      toast.error(
        error instanceof Error ? error.message : 'There was an error processing your request.'
      );
    } finally {
      setIsLoading(false);
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
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Sparkles size={16} className="text-hoa-blue" />
          <span className="ai-gradient-text">Community Intelligence AI</span>
        </div>
        
        <Textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="min-h-24 focus-visible:ring-hoa-blue-200"
          disabled={isLoading}
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
      {answer && (
        <div className="mt-4 whitespace-pre-wrap text-sm border-t pt-4">
          {answer}
        </div>
      )}
    </Card>
  );
};

export default AiQueryInput;
