
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLogViewer } from './log-viewer/useLogViewer';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { RefreshCw, Search } from 'lucide-react';
import { LogsList } from './log-viewer/LogsList';

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

  const handleRefresh = () => {
    fetchLogs();
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>System Logs</span>
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </CardTitle>
        <div className="flex flex-col md:flex-row gap-4 mt-2">
          <div className="flex-1">
            <Select
              value={selectedFunction}
              onValueChange={setSelectedFunction}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select function" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={undefined}>All Functions</SelectItem>
                {functionNames.map((name) => (
                  <SelectItem key={name} value={name}>
                    {name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1">
            <Select
              value={selectedLevel}
              onValueChange={setSelectedLevel}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select log level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={undefined}>All Levels</SelectItem>
                <SelectItem value="info">Info</SelectItem>
                <SelectItem value="warn">Warning</SelectItem>
                <SelectItem value="error">Error</SelectItem>
                <SelectItem value="debug">Debug</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex-grow">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search logs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <LogsList
          logs={logs}
          isLoading={isLoading}
          searchQuery={searchQuery}
          expandedLogId={expandedLogId}
          setExpandedLogId={setExpandedLogId}
        />
      </CardContent>
    </Card>
  );
};

export default LogViewer;
