
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw } from 'lucide-react';
import { LogFilters } from './log-viewer/LogFilters';
import { LogsList } from './log-viewer/LogsList';
import { useLogViewer } from './log-viewer/useLogViewer';

interface LogViewerProps {
  initialFunction?: string;
}

const LogViewer: React.FC<LogViewerProps> = ({ initialFunction }) => {
  const {
    logs,
    isLoading,
    functionNames,
    selectedFunction,
    setSelectedFunction,
    selectedLevel,
    setSelectedLevel,
    searchQuery,
    setSearchQuery,
    expandedLogId,
    setExpandedLogId,
    fetchLogs
  } = useLogViewer(initialFunction);
  
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
          <LogFilters
            selectedFunction={selectedFunction}
            setSelectedFunction={setSelectedFunction}
            selectedLevel={selectedLevel}
            setSelectedLevel={setSelectedLevel}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            functionNames={functionNames}
          />
          
          <LogsList
            logs={logs}
            isLoading={isLoading}
            searchQuery={searchQuery}
            expandedLogId={expandedLogId}
            setExpandedLogId={setExpandedLogId}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default LogViewer;
