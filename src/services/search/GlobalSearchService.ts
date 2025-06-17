
import { supabase } from '@/integrations/supabase/client';

export interface ServerSearchResult {
  id: string;
  type: 'association' | 'request' | 'lead' | 'invoice';
  title: string;
  subtitle?: string;
  path: string;
  rank: number;
  matchedField?: string;
  created_at: string;
}

export interface SearchResponse {
  results: ServerSearchResult[];
  total: number;
  query: string;
  suggestions?: string[];
  performance: {
    searchTime: number;
    resultCount: number;
  };
}

export interface SearchFilters {
  associationId?: string;
  dateRange?: {
    start: string;
    end: string;
  };
}

export interface SearchOptions {
  types?: string[];
  limit?: number;
  offset?: number;
  filters?: SearchFilters;
}

class GlobalSearchService {
  private cache = new Map<string, { data: SearchResponse; timestamp: number }>();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes
  
  async search(query: string, options: SearchOptions = {}): Promise<SearchResponse> {
    const cacheKey = this.generateCacheKey(query, options);
    
    // Check cache first
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      console.log('Returning cached search results for:', query);
      return cached.data;
    }

    try {
      console.log('Making server search request:', { query, options });
      
      const { data, error } = await supabase.functions.invoke('global-search', {
        body: {
          query,
          types: options.types,
          limit: options.limit,
          offset: options.offset,
          filters: options.filters
        }
      });

      if (error) {
        console.error('Server search error:', error);
        throw new Error(`Search failed: ${error.message}`);
      }

      const response: SearchResponse = data;
      
      // Cache the result
      this.cache.set(cacheKey, { data: response, timestamp: Date.now() });
      
      // Clean old cache entries
      this.cleanCache();
      
      return response;
      
    } catch (error) {
      console.error('Error in global search service:', error);
      throw error;
    }
  }

  async searchWithOperators(query: string, options: SearchOptions = {}): Promise<SearchResponse> {
    // Parse search operators like "type:invoice" or "status:open"
    const { cleanQuery, parsedFilters } = this.parseSearchOperators(query);
    
    const mergedOptions: SearchOptions = {
      ...options,
      filters: {
        ...options.filters,
        ...parsedFilters
      }
    };

    return this.search(cleanQuery, mergedOptions);
  }

  private parseSearchOperators(query: string): { cleanQuery: string; parsedFilters: SearchFilters } {
    const operators = {
      type: /type:(\w+)/g,
      association: /association:([a-f0-9-]+)/g,
      after: /after:(\d{4}-\d{2}-\d{2})/g,
      before: /before:(\d{4}-\d{2}-\d{2})/g
    };

    let cleanQuery = query;
    const parsedFilters: SearchFilters = {};

    // Parse type operator
    const typeMatch = operators.type.exec(query);
    if (typeMatch) {
      // This would be handled in the search options
      cleanQuery = cleanQuery.replace(operators.type, '').trim();
    }

    // Parse association operator
    const associationMatch = operators.association.exec(query);
    if (associationMatch) {
      parsedFilters.associationId = associationMatch[1];
      cleanQuery = cleanQuery.replace(operators.association, '').trim();
    }

    // Parse date operators
    const afterMatch = operators.after.exec(query);
    const beforeMatch = operators.before.exec(query);
    
    if (afterMatch || beforeMatch) {
      parsedFilters.dateRange = {
        start: afterMatch ? afterMatch[1] : '1900-01-01',
        end: beforeMatch ? beforeMatch[1] : new Date().toISOString().split('T')[0]
      };
      
      cleanQuery = cleanQuery
        .replace(operators.after, '')
        .replace(operators.before, '')
        .trim();
    }

    return { cleanQuery: cleanQuery.replace(/\s+/g, ' ').trim(), parsedFilters };
  }

  private generateCacheKey(query: string, options: SearchOptions): string {
    return `search:${query}:${JSON.stringify(options)}`;
  }

  private cleanCache(): void {
    const now = Date.now();
    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp > this.CACHE_TTL) {
        this.cache.delete(key);
      }
    }
  }

  clearCache(): void {
    this.cache.clear();
  }
}

export const globalSearchService = new GlobalSearchService();
