
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface QueryResult {
  data: any[];
  sql: string;
  explanation: string;
  executionTime: number;
}

interface QueryHistoryEntry {
  id: string;
  query: string;
  result: QueryResult;
  timestamp: Date;
}

export const useAIQuery = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [queryHistory, setQueryHistory] = useState<QueryHistoryEntry[]>([]);
  const [lastResult, setLastResult] = useState<QueryResult | null>(null);

  const executeQuery = useCallback(async (naturalLanguageQuery: string) => {
    setIsLoading(true);
    const startTime = Date.now();
    
    try {
      // Simple query mapping for demonstration
      let table = 'associations';
      let sql = 'SELECT * FROM associations';
      
      if (naturalLanguageQuery.toLowerCase().includes('resident')) {
        table = 'residents';
        sql = 'SELECT * FROM residents';
      } else if (naturalLanguageQuery.toLowerCase().includes('announcement')) {
        table = 'announcements';
        sql = 'SELECT * FROM announcements';
      } else if (naturalLanguageQuery.toLowerCase().includes('assessment')) {
        table = 'assessments';
        sql = 'SELECT * FROM assessments';
      }

      const { data, error } = await supabase
        .from(table as any)
        .select('*')
        .limit(50);

      if (error) throw error;

      const executionTime = Date.now() - startTime;
      
      const result: QueryResult = {
        data: data || [],
        sql,
        explanation: `Executed a query to fetch ${table} data based on your request: "${naturalLanguageQuery}"`,
        executionTime
      };

      setLastResult(result);
      
      const historyEntry: QueryHistoryEntry = {
        id: Date.now().toString(),
        query: naturalLanguageQuery,
        result,
        timestamp: new Date()
      };
      
      setQueryHistory(prev => [historyEntry, ...prev.slice(0, 9)]);
      
      toast.success(`Query executed successfully! Found ${data?.length || 0} results.`);
    } catch (error) {
      console.error('Query execution error:', error);
      toast.error('Failed to execute query');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearHistory = useCallback(() => {
    setQueryHistory([]);
    toast.success('Query history cleared');
  }, []);

  return {
    isLoading,
    queryHistory,
    lastResult,
    executeQuery,
    clearHistory
  };
};
