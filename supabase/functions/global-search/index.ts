
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SearchRequest {
  query: string;
  types?: string[];
  limit?: number;
  offset?: number;
  filters?: {
    associationId?: string;
    dateRange?: {
      start: string;
      end: string;
    };
  };
}

interface SearchResult {
  id: string;
  type: string;
  title: string;
  subtitle?: string;
  path: string;
  rank: number;
  matchedField?: string;
  created_at: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { query, types = ['association', 'request', 'lead', 'invoice'], limit = 20, offset = 0, filters }: SearchRequest = await req.json();

    console.log('Search request:', { query, types, limit, offset, filters });

    // Validate input
    if (!query || query.trim().length < 2) {
      return new Response(
        JSON.stringify({ error: 'Query must be at least 2 characters long' }),
        { 
          status: 400, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      );
    }

    // Clean and prepare search query
    const cleanQuery = query.trim().replace(/[^\w\s]/g, ' ').replace(/\s+/g, ' ');
    
    // Call the database function for search
    const { data: searchResults, error } = await supabase.rpc('global_search', {
      search_query: cleanQuery,
      result_limit: Math.min(limit, 100), // Cap at 100 results
      result_offset: offset,
      search_types: types
    });

    if (error) {
      console.error('Database search error:', error);
      return new Response(
        JSON.stringify({ error: 'Search failed', details: error.message }),
        { 
          status: 500, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      );
    }

    // Process and enhance results
    const processedResults: SearchResult[] = (searchResults || []).map((result: any) => ({
      id: result.id,
      type: result.type,
      title: result.title,
      subtitle: result.subtitle,
      path: result.path,
      rank: result.rank,
      matchedField: determineMatchedField(result.title, result.subtitle, cleanQuery),
      created_at: result.created_at
    }));

    // Apply additional filters if provided
    let filteredResults = processedResults;
    
    if (filters?.associationId) {
      // Note: This would require additional logic to filter by association
      // For now, we'll skip this filter as it's complex to implement in the view
    }

    if (filters?.dateRange) {
      const startDate = new Date(filters.dateRange.start);
      const endDate = new Date(filters.dateRange.end);
      
      filteredResults = filteredResults.filter(result => {
        const resultDate = new Date(result.created_at);
        return resultDate >= startDate && resultDate <= endDate;
      });
    }

    // Add search suggestions for typos (basic implementation)
    const suggestions = generateSearchSuggestions(cleanQuery, filteredResults.length);

    const response = {
      results: filteredResults,
      total: filteredResults.length,
      query: cleanQuery,
      suggestions: suggestions.length > 0 ? suggestions : undefined,
      performance: {
        searchTime: Date.now(),
        resultCount: filteredResults.length
      }
    };

    console.log('Search completed:', { resultCount: filteredResults.length, query: cleanQuery });

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    console.error('Error in global-search function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', message: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

function determineMatchedField(title: string, subtitle: string | null, query: string): string {
  const lowerQuery = query.toLowerCase();
  const lowerTitle = title.toLowerCase();
  const lowerSubtitle = subtitle?.toLowerCase() || '';

  if (lowerTitle.includes(lowerQuery)) {
    return 'title';
  } else if (lowerSubtitle.includes(lowerQuery)) {
    return 'subtitle';
  }
  return 'content';
}

function generateSearchSuggestions(query: string, resultCount: number): string[] {
  // Basic implementation - in a real app, you'd have a more sophisticated approach
  if (resultCount > 0) return [];

  const suggestions: string[] = [];
  
  // Common typo corrections
  const typoMap: { [key: string]: string } = {
    'asocitation': 'association',
    'invoic': 'invoice',
    'requeset': 'request',
    'leed': 'lead'
  };

  const words = query.split(' ');
  words.forEach(word => {
    if (typoMap[word.toLowerCase()]) {
      suggestions.push(query.replace(word, typoMap[word.toLowerCase()]));
    }
  });

  return suggestions.slice(0, 3); // Limit to 3 suggestions
}

serve(handler);
