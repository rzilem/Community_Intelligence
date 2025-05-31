
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Sparkles, 
  Send, 
  History, 
  Lightbulb, 
  Loader2,
  Database,
  Clock,
  RefreshCw
} from 'lucide-react';
import { useAIQuerySystem } from '@/hooks/ai/useAIQuerySystem';
import { toast } from 'sonner';

interface AIQueryInterfaceProps {
  context?: string;
  className?: string;
}

const AIQueryInterface: React.FC<AIQueryInterfaceProps> = ({ 
  context, 
  className = '' 
}) => {
  const [query, setQuery] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [activeResult, setActiveResult] = useState<any>(null);
  
  const {
    processNaturalLanguageQuery,
    isLoading,
    queryHistory,
    getSuggestedQueries,
    clearHistory
  } = useAIQuerySystem();

  const handleSubmit = async (queryText: string = query) => {
    if (!queryText.trim()) {
      toast.error('Please enter a query');
      return;
    }

    try {
      const response = await processNaturalLanguageQuery(queryText, { context });
      setActiveResult(response);
      setQuery('');
    } catch (error) {
      console.error('Query submission error:', error);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
  };

  const handleHistoryItemClick = (historyItem: any) => {
    setActiveResult(historyItem.response);
    setQuery(historyItem.query);
  };

  const renderResult = (result: any) => {
    if (!result) return null;

    if (result.error) {
      return (
        <div className="p-4 border border-red-200 rounded-lg bg-red-50">
          <p className="text-red-700">{result.explanation}</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="p-4 border border-green-200 rounded-lg bg-green-50">
          <p className="text-green-700 font-medium">{result.explanation}</p>
        </div>
        
        {result.query && (
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Database className="h-4 w-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-600">Generated Query:</span>
            </div>
            <code className="text-sm text-gray-800">{result.query}</code>
          </div>
        )}

        {result.result && (
          <div className="border rounded-lg p-4">
            <h4 className="font-medium mb-3">Results:</h4>
            {Array.isArray(result.result) ? (
              <div className="space-y-2">
                {result.result.map((item: any, index: number) => (
                  <div key={index} className="p-3 border rounded bg-gray-50">
                    <pre className="text-sm">{JSON.stringify(item, null, 2)}</pre>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-3 border rounded bg-gray-50">
                <pre className="text-sm">{JSON.stringify(result.result, null, 2)}</pre>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const suggestions = getSuggestedQueries(context);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Query Input */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-blue-600" />
            AI Query System
            <Badge variant="secondary" className="ml-auto">MILESTONE 4</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <Textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask anything about your HOA data... (e.g., 'Show me all active homeowners' or 'What maintenance requests are overdue?')"
              className="min-h-[80px]"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
            />
            
            <div className="flex justify-between items-center">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowHistory(!showHistory)}
                >
                  <History className="h-4 w-4 mr-1" />
                  History ({queryHistory.length})
                </Button>
                {queryHistory.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearHistory}
                  >
                    <RefreshCw className="h-4 w-4 mr-1" />
                    Clear
                  </Button>
                )}
              </div>
              
              <Button 
                onClick={() => handleSubmit()}
                disabled={isLoading || !query.trim()}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Send className="h-4 w-4 mr-2" />
                )}
                {isLoading ? 'Processing...' : 'Ask AI'}
              </Button>
            </div>
          </div>

          {/* Query Suggestions */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-yellow-600" />
              <span className="text-sm font-medium">Suggested Queries:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {suggestions.slice(0, 4).map((suggestion, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="text-xs h-7"
                >
                  {suggestion}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Query History */}
      {showHistory && queryHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Query History</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px]">
              <div className="space-y-3">
                {queryHistory.map((item, index) => (
                  <div key={item.id}>
                    <div 
                      className="p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => handleHistoryItemClick(item)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-sm">{item.query}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {item.response.explanation}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-400">
                          <Clock className="h-3 w-3" />
                          {item.timestamp.toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                    {index < queryHistory.length - 1 && <Separator className="my-2" />}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Query Results */}
      {activeResult && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Query Results</CardTitle>
          </CardHeader>
          <CardContent>
            {renderResult(activeResult)}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AIQueryInterface;
