
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
  analytics?: {
    popularTerms: string[];
    averageResponseTime: number;
    totalSearches: number;
  };
}

export interface SearchFilters {
  associationId?: string;
  dateRange?: {
    start: string;
    end: string;
  };
  status?: string[];
  priority?: string[];
  types?: string[];
  assignedTo?: string[];
  amount?: {
    operator: string;
    value: number;
  };
}

export interface SearchOptions {
  types?: string[];
  limit?: number;
  offset?: number;
  filters?: SearchFilters;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

class GlobalSearchService {
  private cache = new Map<string, { data: SearchResponse; timestamp: number }>();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes
  private analytics = {
    totalSearches: 0,
    averageResponseTime: 0,
    popularTerms: [] as string[]
  };
  
  async search(query: string, options: SearchOptions = {}): Promise<SearchResponse> {
    const cacheKey = this.generateCacheKey(query, options);
    
    // Check cache first
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      console.log('Returning cached search results for:', query);
      return cached.data;
    }

    const startTime = Date.now();

    try {
      console.log('Making enhanced server search request:', { query, options });
      
      const { data, error } = await supabase.functions.invoke('global-search', {
        body: {
          query,
          types: options.types,
          limit: options.limit,
          offset: options.offset,
          filters: options.filters,
          sortBy: options.sortBy,
          sortOrder: options.sortOrder
        }
      });

      if (error) {
        console.error('Server search error:', error);
        throw new Error(`Search failed: ${error.message}`);
      }

      const searchTime = Date.now() - startTime;
      
      // Update analytics
      this.updateAnalytics(query, searchTime);

      const response: SearchResponse = {
        ...data,
        analytics: this.analytics,
        performance: {
          ...data.performance,
          searchTime
        }
      };
      
      // Cache the result
      this.cache.set(cacheKey, { data: response, timestamp: Date.now() });
      
      // Clean old cache entries
      this.cleanCache();
      
      return response;
      
    } catch (error) {
      console.error('Error in enhanced global search service:', error);
      throw error;
    }
  }

  async searchWithOperators(query: string, options: SearchOptions = {}): Promise<SearchResponse> {
    // Enhanced operator parsing is now handled in the SearchOperatorParser
    return this.search(query, options);
  }

  async getSearchSuggestions(query: string): Promise<string[]> {
    // Generate smart suggestions based on query and search history
    const suggestions: string[] = [];
    
    // Popular terms matching the query
    const matchingTerms = this.analytics.popularTerms
      .filter(term => term.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 3);
    
    suggestions.push(...matchingTerms);
    
    // Add operator suggestions
    if (query.includes(':')) {
      const operatorSuggestions = [
        'type:invoice',
        'status:open',
        'priority:high',
        'after:2024-01-01'
      ].filter(op => op.toLowerCase().includes(query.toLowerCase()));
      
      suggestions.push(...operatorSuggestions);
    }
    
    return suggestions.slice(0, 5);
  }

  async exportSearchResults(results: ServerSearchResult[], format: 'csv' | 'json' = 'csv'): Promise<string> {
    if (format === 'json') {
      return JSON.stringify(results, null, 2);
    }
    
    // CSV export
    const headers = ['Type', 'Title', 'Subtitle', 'Path', 'Rank', 'Created Date'];
    const rows = results.map(result => [
      result.type,
      `"${result.title.replace(/"/g, '""')}"`,
      `"${(result.subtitle || '').replace(/"/g, '""')}"`,
      result.path,
      result.rank.toString(),
      new Date(result.created_at).toLocaleDateString()
    ]);
    
    return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
  }

  getSearchAnalytics() {
    return this.analytics;
  }

  private updateAnalytics(query: string, responseTime: number) {
    this.analytics.totalSearches++;
    this.analytics.averageResponseTime = 
      (this.analytics.averageResponseTime * (this.analytics.totalSearches - 1) + responseTime) / 
      this.analytics.totalSearches;
    
    // Update popular terms
    const cleanQuery = query.toLowerCase().trim();
    if (cleanQuery && !this.analytics.popularTerms.includes(cleanQuery)) {
      this.analytics.popularTerms.unshift(cleanQuery);
      this.analytics.popularTerms = this.analytics.popularTerms.slice(0, 20);
    }
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

  clearAnalytics(): void {
    this.analytics = {
      totalSearches: 0,
      averageResponseTime: 0,
      popularTerms: []
    };
  }
}

export const globalSearchService = new GlobalSearchService();
