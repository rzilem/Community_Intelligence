
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AIQueryResult {
  data: any[];
  sql: string;
  explanation: string;
  executionTime: number;
}

interface QueryHistory {
  id: string;
  query: string;
  result: AIQueryResult;
  timestamp: Date;
}

export const useAIQuery = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [queryHistory, setQueryHistory] = useState<QueryHistory[]>([]);
  const [lastResult, setLastResult] = useState<AIQueryResult | null>(null);

  const executeQuery = useCallback(async (naturalLanguageQuery: string) => {
    setIsLoading(true);
    const startTime = Date.now();
    
    try {
      console.log('Executing AI query:', naturalLanguageQuery);
      
      // For demo purposes, we'll simulate AI processing and create smart SQL queries
      const aiResponse = await processNaturalLanguageQuery(naturalLanguageQuery);
      
      // Execute the generated SQL
      const { data, error } = await supabase
        .from(aiResponse.table)
        .select(aiResponse.select)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const executionTime = Date.now() - startTime;
      
      const result: AIQueryResult = {
        data: data || [],
        sql: aiResponse.sql,
        explanation: aiResponse.explanation,
        executionTime
      };

      setLastResult(result);
      
      // Add to history
      const historyEntry: QueryHistory = {
        id: Math.random().toString(36).substring(7),
        query: naturalLanguageQuery,
        result,
        timestamp: new Date()
      };
      
      setQueryHistory(prev => [historyEntry, ...prev.slice(0, 9)]); // Keep last 10
      
      toast.success(`Query executed in ${executionTime}ms`);
      return result;
      
    } catch (error: any) {
      console.error('AI Query error:', error);
      toast.error('Failed to execute query: ' + error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearHistory = useCallback(() => {
    setQueryHistory([]);
    setLastResult(null);
  }, []);

  return {
    isLoading,
    queryHistory,
    lastResult,
    executeQuery,
    clearHistory
  };
};

// AI Query Processing Engine
async function processNaturalLanguageQuery(query: string): Promise<{
  table: string;
  select: string;
  sql: string;
  explanation: string;
}> {
  const lowerQuery = query.toLowerCase();
  
  // Smart query detection patterns
  if (lowerQuery.includes('resident') || lowerQuery.includes('homeowner')) {
    return {
      table: 'residents',
      select: '*',
      sql: 'SELECT * FROM residents ORDER BY created_at DESC',
      explanation: 'Retrieved all residents with their contact information and property details.'
    };
  }
  
  if (lowerQuery.includes('association') || lowerQuery.includes('hoa')) {
    return {
      table: 'associations',
      select: '*',
      sql: 'SELECT * FROM associations ORDER BY created_at DESC',
      explanation: 'Retrieved all HOA associations with their management details.'
    };
  }
  
  if (lowerQuery.includes('payment') || lowerQuery.includes('assessment')) {
    return {
      table: 'assessments',
      select: '*, properties(address)',
      sql: 'SELECT assessments.*, properties.address FROM assessments JOIN properties ON assessments.property_id = properties.id ORDER BY due_date DESC',
      explanation: 'Retrieved assessment payments with property addresses, sorted by due date.'
    };
  }
  
  if (lowerQuery.includes('amenity') || lowerQuery.includes('booking')) {
    return {
      table: 'amenity_bookings',
      select: '*, amenities(name)',
      sql: 'SELECT amenity_bookings.*, amenities.name FROM amenity_bookings JOIN amenities ON amenity_bookings.amenity_id = amenities.id ORDER BY booking_date DESC',
      explanation: 'Retrieved amenity bookings with facility names, sorted by booking date.'
    };
  }
  
  // Default fallback
  return {
    table: 'associations',
    select: '*',
    sql: 'SELECT * FROM associations ORDER BY created_at DESC',
    explanation: 'Default query: Retrieved all associations. Try asking about residents, payments, amenities, or bookings.'
  };
}
