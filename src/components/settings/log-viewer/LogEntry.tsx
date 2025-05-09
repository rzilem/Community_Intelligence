
import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { LogEntry as LogEntryType, getLevelBadge } from './log-utils';

interface LogEntryProps {
  log: LogEntryType;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

export const LogEntryItem: React.FC<LogEntryProps> = ({ 
  log, 
  isExpanded,
  onToggleExpand
}) => {
  return (
    <div 
      className="p-3 border rounded-md bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer transition-colors"
      onClick={onToggleExpand}
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
      
      {isExpanded && (
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
  );
};
