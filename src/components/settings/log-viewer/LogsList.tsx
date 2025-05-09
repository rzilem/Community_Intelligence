
import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Terminal } from 'lucide-react';
import { LogEntryItem } from './LogEntry';
import { LogEntry, filterLogs } from './log-utils';

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
  setExpandedLogId
}) => {
  const filteredLogs = filterLogs(logs, searchQuery);
  
  const toggleLogExpansion = (logId: string) => {
    if (expandedLogId === logId) {
      setExpandedLogId(null);
    } else {
      setExpandedLogId(logId);
    }
  };
  
  return (
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
            <LogEntryItem 
              key={log.id} 
              log={log} 
              isExpanded={expandedLogId === log.id}
              onToggleExpand={() => toggleLogExpansion(log.id)}
            />
          ))}
        </div>
      )}
    </ScrollArea>
  );
};
