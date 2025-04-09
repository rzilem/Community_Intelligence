
import React, { useState } from 'react';
import { Sparkles, Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { EnhancedAIQueryDemo } from './EnhancedAIQueryDemo';

interface AiQueryInputProps {
  onQuery?: (query: string) => Promise<void>;
  placeholder?: string;
  className?: string;
  compact?: boolean;
  useDemo?: boolean;
}

export const AiQueryInput: React.FC<AiQueryInputProps> = ({
  onQuery,
  placeholder = "Ask Community Intelligence anything...",
  className,
  compact = false,
  useDemo = false,
}) => {
  // If demo mode is requested, use the enhanced demo component
  if (useDemo) {
    return (
      <EnhancedAIQueryDemo
        onQuery={onQuery}
        placeholder={placeholder}
        className={className}
        compact={compact}
      />
    );
  }

  // Original implementation for non-demo use
  const [query, setQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    setIsLoading(true);

    try {
      // In a real implementation, this would connect to Supabase and OpenAI
      if (onQuery) {
        await onQuery(query);
      } else {
        // Demo fallback
        await new Promise(resolve => setTimeout(resolve, 1500));
        toast.success("AI feature coming soon! Your query has been logged.");
      }
      setQuery('');
    } catch (error) {
      console.error("Error processing AI query:", error);
      toast.error("There was an error processing your request.");
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
    </Card>
  );
};

export default AiQueryInput;
