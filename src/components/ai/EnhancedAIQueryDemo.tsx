
import React, { useState, useEffect } from 'react';
import { Sparkles, Send, Loader2, ListRestart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { aiDemoQuestions, AIDemoQuestion } from '@/data/ai-demo-data';

interface EnhancedAIQueryDemoProps {
  onQuery?: (query: string) => Promise<void>;
  placeholder?: string;
  className?: string;
  compact?: boolean;
  suggestionsVisible?: boolean;
}

export const EnhancedAIQueryDemo: React.FC<EnhancedAIQueryDemoProps> = ({
  onQuery,
  placeholder = "Ask Community Intelligence anything...",
  className,
  compact = false,
  suggestionsVisible = true,
}) => {
  const [query, setQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [responseText, setResponseText] = useState<string>('');
  const [showResponse, setShowResponse] = useState<boolean>(false);
  const [suggestions] = useState<AIDemoQuestion[]>(aiDemoQuestions);
  const [selectedSuggestion, setSelectedSuggestion] = useState<AIDemoQuestion | null>(null);

  useEffect(() => {
    if (selectedSuggestion) {
      setQuery(selectedSuggestion.question);
    }
  }, [selectedSuggestion]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    setIsLoading(true);
    setShowResponse(false);

    try {
      // Find if we have a pre-defined answer
      const matchedQuestion = suggestions.find(
        suggestion => suggestion.question.toLowerCase() === query.toLowerCase()
      );
      
      if (matchedQuestion) {
        // Simulate typing effect
        setResponseText('');
        setShowResponse(true);
        
        // Simulate AI thinking time
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Display answer character by character
        const answer = matchedQuestion.answer;
        for (let i = 0; i <= answer.length; i++) {
          setResponseText(answer.substring(0, i));
          await new Promise(resolve => setTimeout(resolve, 15)); // Speed of typing effect
        }
      } else if (onQuery) {
        await onQuery(query);
        setShowResponse(true);
        setResponseText("I've processed your request. In a real implementation, this would connect to our AI backend for a personalized response. For now, try one of the example questions below.");
      } else {
        // Demo fallback
        await new Promise(resolve => setTimeout(resolve, 1500));
        setShowResponse(true);
        setResponseText("I've processed your request. In a real implementation, this would connect to our AI backend for a personalized response. For now, try one of the example questions below.");
        toast.success("AI feature demo activated! Try our sample questions for best results.");
      }
    } catch (error) {
      console.error("Error processing AI query:", error);
      toast.error("There was an error processing your request.");
      setShowResponse(true);
      setResponseText("I apologize, but I encountered an error processing your request. Please try again later or use one of our example queries.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion: AIDemoQuestion) => {
    setSelectedSuggestion(suggestion);
    setResponseText('');
    setShowResponse(false);
  };

  const resetDemo = () => {
    setQuery('');
    setResponseText('');
    setShowResponse(false);
    setSelectedSuggestion(null);
  };

  if (compact) {
    return (
      <div className="space-y-4">
        <form onSubmit={handleSubmit} className="relative flex items-center w-full">
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

        {showResponse && (
          <Card className="p-4 text-sm bg-muted/50">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={16} className="text-hoa-blue" />
              <span className="font-medium">Community Intelligence</span>
            </div>
            <p>{responseText}</p>
          </Card>
        )}

        {suggestionsVisible && (
          <div className="text-xs text-muted-foreground mt-2">
            Try asking: 
            <Button 
              variant="link" 
              className="text-xs p-0 h-auto ml-1"
              onClick={() => handleSuggestionClick(suggestions[Math.floor(Math.random() * suggestions.length)])}
            >
              {suggestions[0].question.length > 30 
                ? suggestions[0].question.substring(0, 30) + '...' 
                : suggestions[0].question}
            </Button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
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
          
          <div className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={resetDemo}
              disabled={isLoading}
              className="gap-2"
            >
              <ListRestart size={16} />
              Reset
            </Button>
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

      {showResponse && (
        <Card className="p-4 bg-muted/30 border shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles size={16} className="text-hoa-blue" />
            <span className="font-medium">Community Intelligence Response:</span>
          </div>
          <div className="prose prose-sm max-w-none">
            <p>{responseText}</p>
          </div>
        </Card>
      )}

      {suggestionsVisible && (
        <div className="mt-6">
          <h3 className="text-sm font-medium mb-3">Example questions you can ask:</h3>
          <div className="grid gap-2">
            {suggestions.slice(0, 5).map((suggestion) => (
              <Button
                key={suggestion.id}
                variant="ghost"
                className="justify-start h-auto py-2 px-3 text-sm text-left"
                onClick={() => handleSuggestionClick(suggestion)}
              >
                <Sparkles size={14} className="mr-2 text-hoa-blue shrink-0" />
                <span className="truncate">{suggestion.question}</span>
              </Button>
            ))}
            <Button
              variant="link"
              className="text-xs justify-start mt-1"
              onClick={() => handleSuggestionClick(suggestions[Math.floor(Math.random() * suggestions.length)])}
            >
              Show me another question...
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedAIQueryDemo;
