
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface LogEntry {
  id: string;
  request_id: string;
  function_name: string;
  timestamp: string;
  level: string;
  message: string;
  metadata?: Record<string, any>;
  created_at: string;
}

export const useLogViewer = (initialFunction?: string) => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFunction, setSelectedFunction] = useState<string | undefined>(initialFunction);
  const [selectedLevel, setSelectedLevel] = useState<string | undefined>(undefined);
  const [functionNames, setFunctionNames] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  const fetchLogs = useCallback(async () => {
    setIsLoading(true);
    
    try {
      console.log('Fetching logs with filters:', {
        function: selectedFunction,
        level: selectedLevel,
        search: searchQuery
      });
      
      // Build query parameters
      const params = new URLSearchParams();
      if (selectedFunction) {
        params.append('function_name', selectedFunction);
      }
      if (selectedLevel) {
        params.append('level', selectedLevel);
      }
      params.append('limit', '100'); // Default limit
      
      // Use the correct parameter for invoking functions in Supabase
      const { data, error } = await supabase.functions.invoke('view-logs', {
        method: 'GET',
        params: Object.fromEntries(params)
      });
      
      if (error) {
        console.error('Error fetching logs:', error);
        throw error;
      }
      
      console.log('Logs fetched:', data);
      
      // Set logs and function names from the response
      setLogs(data?.logs || []);
      setFunctionNames(data?.function_names || []);
      
    } catch (error) {
      console.error('Failed to fetch logs:', error);
      setLogs([]);
    } finally {
      setIsLoading(false);
    }
  }, [selectedFunction, selectedLevel, searchQuery]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // Filter logs based on search query (client-side filtering)
  const filteredLogs = logs.filter(log => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      log.message.toLowerCase().includes(query) ||
      log.function_name.toLowerCase().includes(query) ||
      log.level.toLowerCase().includes(query) ||
      log.request_id.toLowerCase().includes(query) ||
      JSON.stringify(log.metadata).toLowerCase().includes(query)
    );
  });

  return {
    logs: filteredLogs,
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
