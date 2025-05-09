
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Loader2, RefreshCw, Terminal, AlertCircle, Info, CheckCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

interface LogEntry {
  id: string;
  request_id: string;
  function_name: string;
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  metadata?: any;
}

interface LogViewerProps {
  initialFunction?: string;
}

const LogViewer: React.FC<LogViewerProps> = ({ initialFunction }) => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [functionNames, setFunctionNames] = useState<string[]>([]);
  const [selectedFunction, setSelectedFunction] = useState<string | undefined>(initialFunction);
  const [selectedLevel, setSelectedLevel] = useState<string | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      // Build query parameters
      const queryParams = new URLSearchParams();
      if (selectedFunction) queryParams.append('function', selectedFunction);
      if (selectedLevel) queryParams.append('level', selectedLevel);
      queryParams.append('limit', '100');
      
      // Use params property instead of query for FunctionInvokeOptions
      const { data, error } = await supabase.functions.invoke('view-logs', {
        method: 'GET',
        params: {
          function: selectedFunction,
          level: selectedLevel,
          limit: '100'
        }
      });
      
      if (error) {
        throw new Error(error.message || 'Failed to fetch logs');
      }
      
      setLogs(data.logs);
      setFunctionNames(data.filters.availableFunctions);
    } catch (error) {
      console.error('Error fetching logs:', error);
      toast.error(`Failed to load logs: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchLogs();
  }, [selectedFunction, selectedLevel]);
  
  const getLevelBadge = (level: string) => {
    switch (level) {
      case 'error':
        return <Badge variant="destructive" className="ml-2 flex items-center"><AlertCircle className="h-3 w-3 mr-1" /> Error</Badge>;
      case 'warn':
        return <Badge variant="outline" className="ml-2 flex items-center bg-amber-100 text-amber-800 border-amber-200"><Info className="h-3 w-3 mr-1" /> Warning</Badge>;
      case 'info':
        return <Badge variant="outline" className="ml-2 flex items-center bg-blue-100 text-blue-800 border-blue-200"><Info className="h-3 w-3 mr-1" /> Info</Badge>;
      case 'debug':
        return <Badge variant="outline" className="ml-2 flex items-center"><Terminal className="h-3 w-3 mr-1" /> Debug</Badge>;
      default:
        return <Badge variant="secondary" className="ml-2">{level}</Badge>;
    }
  };
  
  const filteredLogs = logs.filter(log => {
    if (!searchQuery) return true;
    
    const searchLower = searchQuery.toLowerCase();
    return (
      log.message.toLowerCase().includes(searchLower) ||
      log.function_name.toLowerCase().includes(searchLower) ||
      log.request_id.toLowerCase().includes(searchLower) ||
      JSON.stringify(log.metadata).toLowerCase().includes(searchLower)
    );
  });
  
  const toggleLogExpansion = (logId: string) => {
    if (expandedLogId === logId) {
      setExpandedLogId(null);
    } else {
      setExpandedLogId(logId);
    }
  };
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle>Function Logs</CardTitle>
          <Button 
            variant="outline" 
            size="sm"
            onClick={fetchLogs}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Loading...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </>
            )}
          </Button>
        </div>
        <CardDescription>
          View logs from Supabase Edge Functions
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="w-full sm:w-1/3">
              <Select 
                value={selectedFunction || ''} 
                onValueChange={(value) => setSelectedFunction(value || undefined)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select function" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Functions</SelectItem>
                  {functionNames.map((name) => (
                    <SelectItem key={name} value={name}>{name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="w-full sm:w-1/3">
              <Select 
                value={selectedLevel || ''} 
                onValueChange={(value) => setSelectedLevel(value || undefined)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select log level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Levels</SelectItem>
                  <SelectItem value="info">Info</SelectItem>
                  <SelectItem value="warn">Warning</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                  <SelectItem value="debug">Debug</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="w-full sm:w-1/3">
              <Input
                placeholder="Search logs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          <ScrollArea className="h-[500px] border rounded-md bg-slate-50 dark:bg-slate-900">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
              </div>
            ) : filteredLogs.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full p-4">
                <Terminal className="h-12 w-12 mb-2 text-muted-foreground" />
                <p className="text-muted-foreground">No logs found</p>
              </div>
            ) : (
              <div className="p-4 space-y-2">
                {filteredLogs.map((log) => (
                  <div 
                    key={log.id}
                    className="p-3 border rounded-md bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer transition-colors"
                    onClick={() => toggleLogExpansion(log.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <span className="font-medium text-sm">{log.function_name}</span>
                        {getLevelBadge(log.level)}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(log.timestamp))} ago
                      </span>
                    </div>
                    
                    <p className="mt-1 text-sm">{log.message}</p>
                    
                    {expandedLogId === log.id && (
                      <div className="mt-2 bg-slate-100 dark:bg-slate-900 p-2 rounded text-xs">
                        <div className="mb-1">
                          <span className="font-semibold">Request ID:</span> {log.request_id}
                        </div>
                        <div className="mb-1">
                          <span className="font-semibold">Timestamp:</span> {new Date(log.timestamp).toLocaleString()}
                        </div>
                        {log.metadata && (
                          <div>
                            <span className="font-semibold">Metadata:</span>
                            <pre className="mt-1 whitespace-pre-wrap overflow-auto">
                              {JSON.stringify(log.metadata, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
};

export default LogViewer;

