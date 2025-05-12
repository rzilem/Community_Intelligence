
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronDown, ChevronUp, Clock, AlertCircle, Info, AlertTriangle } from 'lucide-react';

interface LogEntry {
  id: string;
  request_id: string;
  function_name: string;
  timestamp: string;
  level: string;
  message: string;
  metadata?: Record<string, any>;
  created_at: string;
}

interface LogsListProps {
  logs: LogEntry[];
  isLoading: boolean;
  searchQuery: string;
  expandedLogId: string | null;
  setExpandedLogId: (id: string | null) => void;
}

export const LogsList: React.FC<LogsListProps> = ({
  logs,
  isLoading,
  searchQuery,
  expandedLogId,
  setExpandedLogId,
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const highlightSearchQuery = (text: string) => {
    if (!searchQuery) return text;
    
    const regex = new RegExp(`(${searchQuery})`, 'gi');
    const parts = text.split(regex);
    
    return (
      <>
        {parts.map((part, i) => 
          regex.test(part) ? 
            <span key={i} className="bg-yellow-200 text-black">{part}</span> : 
            <span key={i}>{part}</span>
        )}
      </>
    );
  };

  const getLevelIcon = (level: string) => {
    switch (level.toLowerCase()) {
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'warn':
        return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      case 'info':
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const toggleExpanded = (logId: string) => {
    setExpandedLogId(expandedLogId === logId ? null : logId);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-pulse text-muted-foreground">Loading logs...</div>
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <AlertCircle className="h-8 w-8 text-muted-foreground mb-2" />
        <p className="text-muted-foreground">No logs found</p>
      </div>
    );
  }

  return (
    <div className="space-y-2 mt-2">
      {logs.map((log) => (
        <Card 
          key={log.id} 
          className={`
            overflow-hidden 
            ${log.level === 'error' ? 'border-red-200' : ''} 
            ${log.level === 'warn' ? 'border-amber-200' : ''} 
            ${expandedLogId === log.id ? 'ring-1 ring-primary' : ''}
          `}
        >
          <div 
            className={`
              flex items-center justify-between p-3 cursor-pointer 
              ${log.level === 'error' ? 'bg-red-50' : ''} 
              ${log.level === 'warn' ? 'bg-amber-50' : ''}
            `} 
            onClick={() => toggleExpanded(log.id)}
          >
            <div className="flex items-center space-x-3">
              {getLevelIcon(log.level)}
              <div className="flex-1">
                <div className="font-medium">{highlightSearchQuery(log.message)}</div>
                <div className="text-sm text-muted-foreground">
                  {log.function_name} - {formatDate(log.timestamp)}
                </div>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={(e) => {
              e.stopPropagation();
              toggleExpanded(log.id);
            }}>
              {expandedLogId === log.id ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </div>
          {expandedLogId === log.id && (
            <CardContent className="p-3 pt-0 border-t">
              <div className="space-y-2 mt-2">
                <div className="flex items-center text-sm">
                  <Clock className="h-3 w-3 mr-1 text-muted-foreground" />
                  <span className="text-muted-foreground mr-2">Request ID:</span>
                  <code className="bg-muted px-1 py-0.5 rounded text-sm font-mono">
                    {log.request_id}
                  </code>
                </div>
                
                {log.metadata && Object.keys(log.metadata).length > 0 && (
                  <div>
                    <div className="text-sm font-medium mb-1">Metadata</div>
                    <pre className="bg-muted p-2 rounded text-xs overflow-x-auto">
                      {JSON.stringify(log.metadata, null, 2)}
                    </pre>
                  </div>
                )}
                
                <div className="text-xs text-muted-foreground text-right mt-2">
                  {formatDate(log.created_at)}
                </div>
              </div>
            </CardContent>
          )}
        </Card>
      ))}
    </div>
  );
};
