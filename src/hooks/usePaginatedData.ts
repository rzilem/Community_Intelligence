
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { KnownTables } from '@/hooks/supabase/supabase-utils';

interface PaginationOptions {
  limit?: number;
  initialPage?: number;
}

interface PaginatedResult<T> {
  data: T[];
  count: number;
  error: Error | null;
  loading: boolean;
  page: number;
  pageSize: number;
  pageCount: number;
  hasMore: boolean;
  nextPage: () => void;
  prevPage: () => void;
  goToPage: (page: number) => void;
  refresh: () => Promise<void>;
}

export function usePaginatedData<T = any>(
  table: KnownTables,
  options: PaginationOptions = {},
  filters: Record<string, any> = {},
  orderBy?: { column: string; ascending?: boolean }
): PaginatedResult<T> {
  const { limit = 10, initialPage = 1 } = options;
  
  const [data, setData] = useState<T[]>([]);
  const [count, setCount] = useState(0);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(initialPage);
  
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Get total count for pagination
      let countQuery = supabase
        .from(table)
        .select('id', { count: 'exact', head: true });
      
      // Apply filters to count query
      Object.entries(filters).forEach(([column, value]) => {
        if (value !== undefined && value !== null) {
          countQuery = countQuery.eq(column, value);
        }
      });
      
      const { count: totalCount, error: countError } = await countQuery;
      
      if (countError) throw countError;
      
      // Get paginated data
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      
      let query = supabase
        .from(table)
        .select('*')
        .range(from, to);
      
      // Apply filters
      Object.entries(filters).forEach(([column, value]) => {
        if (value !== undefined && value !== null) {
          query = query.eq(column, value);
        }
      });
      
      // Apply ordering
      if (orderBy) {
        query = query.order(orderBy.column, { ascending: orderBy.ascending ?? true });
      }
      
      const { data: pageData, error: dataError } = await query;
      
      if (dataError) throw dataError;
      
      // Use type assertion to properly handle generic type
      setData(pageData as T[] || []);
      setCount(totalCount || 0);
    } catch (err: any) {
      console.error(`Error fetching paginated data from ${table}:`, err);
      setError(err);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [table, page, limit, filters, orderBy]);
  
  useEffect(() => {
    fetchData();
  }, [fetchData]);
  
  const pageCount = Math.ceil(count / limit);
  const hasMore = page < pageCount;
  
  const nextPage = useCallback(() => {
    if (hasMore) {
      setPage(prev => prev + 1);
    }
  }, [hasMore]);
  
  const prevPage = useCallback(() => {
    if (page > 1) {
      setPage(prev => prev - 1);
    }
  }, [page]);
  
  const goToPage = useCallback((pageNum: number) => {
    if (pageNum >= 1 && pageNum <= pageCount) {
      setPage(pageNum);
    }
  }, [pageCount]);
  
  const refresh = useCallback(async () => {
    await fetchData();
  }, [fetchData]);
  
  return {
    data,
    count,
    error,
    loading,
    page,
    pageSize: limit,
    pageCount,
    hasMore,
    nextPage,
    prevPage,
    goToPage,
    refresh
  };
}
