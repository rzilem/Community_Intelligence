
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Brain, Send, History, Clock, Database, Lightbulb } from 'lucide-react';
import { useAIQuery } from '@/hooks/ai/useAIQuery';
import { format } from 'date-fns';

const AIQueryInterface: React.FC = () => {
  const [query, setQuery] = useState('');
  const { isLoading, queryHistory, lastResult, executeQuery, clearHistory } = useAIQuery();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    try {
      await executeQuery(query);
      setQuery('');
    } catch (error) {
      // Error handled in hook
    }
  };

  const suggestedQueries = [
    "Show me all associations",
    "List recent announcements",
    "Show assessment schedules",
    "Find all residents",
    "Show system settings"
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI Query Assistant
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Ask me anything about your HOA data... (e.g., 'Show me all associations' or 'List recent announcements')"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Suggested queries:</p>
              <div className="flex flex-wrap gap-2">
                {suggestedQueries.map((suggestion) => (
                  <Badge
                    key={suggestion}
                    variant="outline"
                    className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                    onClick={() => setQuery(suggestion)}
                  >
                    {suggestion}
                  </Badge>
                ))}
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      {lastResult && (
        <Tabs defaultValue="results" className="w-full">
          <TabsList>
            <TabsTrigger value="results">Results</TabsTrigger>
            <TabsTrigger value="sql">SQL Query</TabsTrigger>
            <TabsTrigger value="explanation">AI Explanation</TabsTrigger>
          </TabsList>
          
          <TabsContent value="results" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Query Results
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {lastResult.executionTime}ms
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {lastResult.data.length > 0 ? (
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Found {lastResult.data.length} results
                    </p>
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse border border-gray-200">
                        <thead>
                          <tr className="bg-gray-50">
                            {Object.keys(lastResult.data[0]).map((key) => (
                              <th key={key} className="border border-gray-200 px-4 py-2 text-left">
                                {key}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {lastResult.data.slice(0, 10).map((row, index) => (
                            <tr key={index}>
                              {Object.values(row).map((value, i) => (
                                <td key={i} className="border border-gray-200 px-4 py-2">
                                  {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Database className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No results found</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="sql">
            <Card>
              <CardHeader>
                <CardTitle>Generated SQL Query</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto">
                  <code>{lastResult.sql}</code>
                </pre>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="explanation">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5" />
                  AI Explanation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p>{lastResult.explanation}</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Query History
            </span>
            {queryHistory.length > 0 && (
              <Button variant="outline" size="sm" onClick={clearHistory}>
                Clear History
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {queryHistory.length > 0 ? (
            <div className="space-y-3">
              {queryHistory.map((entry) => (
                <div
                  key={entry.id}
                  className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                  onClick={() => setQuery(entry.query)}
                >
                  <div className="flex justify-between items-start mb-1">
                    <p className="font-medium">{entry.query}</p>
                    <span className="text-xs text-muted-foreground">
                      {format(entry.timestamp, 'MMM d, HH:mm')}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {entry.result.data.length} results in {entry.result.executionTime}ms
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <History className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No query history yet</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AIQueryInterface;
