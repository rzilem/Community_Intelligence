
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { LogEntry } from './useLogViewer';
import { highlight } from './log-utils';

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
  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString() + ' ' + date.toLocaleDateString();
  };

  const getLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'error':
        return 'bg-red-100 text-red-800';
      case 'warn':
        return 'bg-amber-100 text-amber-800';
      case 'info':
        return 'bg-blue-100 text-blue-700';
      case 'debug':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground mt-2">Loading logs...</p>
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="text-center py-8 border rounded-md bg-muted/20">
        <p className="text-muted-foreground">No logs found</p>
      </div>
    );
  }
  
  const toggleExpand = (id: string) => {
    if (expandedLogId === id) {
      setExpandedLogId(null);
    } else {
      setExpandedLogId(id);
    }
  };

  const formatMetadata = (metadata: any) => {
    if (!metadata) return null;
    
    try {
      return (
        <div className="bg-muted p-3 rounded-md overflow-x-auto">
          <pre className="text-xs whitespace-pre-wrap font-mono">
            {JSON.stringify(metadata, null, 2)}
          </pre>
        </div>
      );
    } catch (e) {
      return <div className="text-xs text-red-500">Error displaying metadata</div>;
    }
  };

  return (
    <div className="space-y-2">
      {logs.map((log) => {
        const isExpanded = expandedLogId === log.id;
        const levelColor = getLevelColor(log.level);
        const formattedMessage = searchQuery 
          ? highlight(log.message, searchQuery) 
          : log.message;
        
        return (
          <div 
            key={log.id} 
            className={`border rounded-md overflow-hidden ${
              isExpanded ? 'bg-muted/10' : ''
            }`}
          >
            <div 
              className="p-3 flex items-start justify-between cursor-pointer hover:bg-muted/20 transition-colors"
              onClick={() => toggleExpand(log.id)}
            >
              <div className="flex-grow min-w-0">
                <div className="flex items-center gap-3 mb-1 flex-wrap">
                  <Badge variant="outline" className={levelColor + " uppercase text-xs font-medium"}>
                    {log.level}
                  </Badge>
                  <Badge variant="outline" className="bg-gray-100 text-xs">
                    {log.function_name}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {formatDate(log.timestamp)}
                  </span>
                  <span className="text-xs text-muted-foreground truncate">
                    ID: {log.request_id}
                  </span>
                </div>
                <div className="break-words pr-8">
                  <span 
                    dangerouslySetInnerHTML={{ __html: formattedMessage }} 
                    className="text-sm"
                  />
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                className="ml-2 mt-0 h-6 w-6 p-0 rounded-full"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleExpand(log.id);
                }}
              >
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </div>
            
            {isExpanded && log.metadata && (
              <div className="p-3 pt-0 border-t">
                <p className="text-xs text-muted-foreground uppercase mb-2 font-medium">
                  Metadata
                </p>
                {formatMetadata(log.metadata)}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
