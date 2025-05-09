
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
  const [testStatus, setTestStatus] = useState<{ status: string; message: string } | null>(null);

  const fetchLogs = useCallback(async () => {
    setIsLoading(true);
    
    try {
      console.log('Fetching logs with filters:', {
        function: selectedFunction,
        level: selectedLevel,
        search: searchQuery
      });
      
      // Build query string parameters manually
      let url = 'view-logs';
      const urlParams = new URLSearchParams();
      
      if (selectedFunction) {
        urlParams.append('function_name', selectedFunction);
      }
      if (selectedLevel) {
        urlParams.append('level', selectedLevel);
      }
      urlParams.append('limit', '100'); // Default limit
      
      // If we have any params, append them to the URL
      const queryString = urlParams.toString();
      if (queryString) {
        url += `?${queryString}`;
      }
      
      // Invoke the view-logs function with the URL including query parameters
      const { data, error } = await supabase.functions.invoke(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
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

  // New function to test OpenAI extractor authentication
  const testExtractorAuth = async () => {
    try {
      setTestStatus({ status: 'running', message: 'Testing OpenAI extractor authentication...' });
      
      const { data, error } = await supabase.functions.invoke('openai-extractor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: 'This is a test message to verify authentication',
          contentType: 'invoice',
          metadata: { subject: 'Test Subject', from: 'test@example.com' }
        })
      });
      
      if (error) {
        console.error('Authentication test failed:', error);
        setTestStatus({ 
          status: 'failed', 
          message: `Authentication test failed: ${error.message}` 
        });
        return;
      }
      
      console.log('Authentication test result:', data);
      
      if (data?.success) {
        setTestStatus({ 
          status: 'success', 
          message: 'Authentication test successful! OpenAI extractor is accessible.' 
        });
      } else {
        setTestStatus({ 
          status: 'failed', 
          message: `Authentication test failed: ${data?.error || 'Unknown error'}` 
        });
      }
    } catch (error) {
      console.error('Error running authentication test:', error);
      setTestStatus({ 
        status: 'failed', 
        message: `Error running authentication test: ${error.message}` 
      });
    }
  };

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
    fetchLogs,
    testExtractorAuth,
    testStatus
  };
};
