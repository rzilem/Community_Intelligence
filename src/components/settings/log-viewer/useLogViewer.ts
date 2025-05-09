
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { LogEntry } from './log-utils';

export const useLogViewer = (initialFunction?: string) => {
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
      const { data, error } = await supabase.functions.invoke('view-logs', {
        method: 'GET',
        body: {
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

  return {
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
  };
};
