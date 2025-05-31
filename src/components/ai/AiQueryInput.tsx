
import React, { useState } from 'react';
import { Sparkles, Send, Loader2, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useAIQuerySystem } from '@/hooks/ai/useAIQuerySystem';
import { useNavigate } from 'react-router-dom';

interface AiQueryInputProps {
  onQuery?: (query: string) => Promise<void>;
  placeholder?: string;
  className?: string;
  compact?: boolean;
  showAdvancedLink?: boolean;
}

export const AiQueryInput: React.FC<AiQueryInputProps> = ({
  onQuery,
  placeholder = "Ask Community Intelligence anything...",
  className,
  compact = false,
  showAdvancedLink = true,
}) => {
  const [query, setQuery] = useState<string>('');
  const navigate = useNavigate();
  const { processNaturalLanguageQuery, isLoading } = useAIQuerySystem();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    try {
      if (onQuery) {
        await onQuery(query);
      } else {
        // Use the new AI Query System
        const response = await processNaturalLanguageQuery(query);
        if (response.error) {
          toast.error(response.explanation);
        } else {
          toast.success(response.explanation);
        }
      }
      setQuery('');
    } catch (error) {
      console.error("Error processing AI query:", error);
      toast.error("There was an error processing your request.");
    }
  };

  const handleAdvancedClick = () => {
    navigate('/ai-query');
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
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Sparkles size={16} className="text-hoa-blue" />
            <span className="ai-gradient-text">Community Intelligence AI</span>
            <Badge variant="secondary" className="text-xs">MILESTONE 4</Badge>
          </div>
          
          {showAdvancedLink && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAdvancedClick}
              className="text-xs"
            >
              <ExternalLink size={12} className="mr-1" />
              Advanced
            </Button>
          )}
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
