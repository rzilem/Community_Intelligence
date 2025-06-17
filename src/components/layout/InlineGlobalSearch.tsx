import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Filter, History, Sparkles, Download, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useServerSearch } from '@/hooks/search/useServerSearch';
import { toast } from 'sonner';
import AdvancedSearchFilters, { SearchFilters } from '@/components/search/AdvancedSearchFilters';
import SearchHistory from '@/components/search/SearchHistory';
import SmartSuggestions from '@/components/search/SmartSuggestions';
import SearchOperatorParser from '@/services/search/SearchOperatorParser';

const InlineGlobalSearch: React.FC = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({});
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [searchAnalytics, setSearchAnalytics] = useState({
    totalSearches: 0,
    avgResponseTime: 0,
    popularQueries: [] as string[]
  });

  const inputRef = useRef<HTMLInputElement>(null);
  const searchHistoryRef = useRef<any>(null);
  
  const { 
    results, 
    isLoading, 
    error, 
    search, 
    searchWithOperators,
    total,
    suggestions,
    clearResults 
  } = useServerSearch();

  // Enhanced search function that parses operators
  const performSearch = useCallback(async (searchQuery: string, searchFilters?: SearchFilters) => {
    if (!searchQuery.trim()) {
      clearResults();
      return;
    }

    const startTime = Date.now();
    
    try {
      // Parse search operators
      const parsed = SearchOperatorParser.parse(searchQuery);
      const mergedFilters = { ...searchFilters, ...parsed.filters };
      
      // Perform search
      if (Object.keys(parsed.operators).length > 0) {
        await searchWithOperators(searchQuery, { filters: mergedFilters });
      } else {
        await search(parsed.query, { filters: mergedFilters });
      }

      // Track analytics
      const responseTime = Date.now() - startTime;
      setSearchAnalytics(prev => ({
        totalSearches: prev.totalSearches + 1,
        avgResponseTime: (prev.avgResponseTime * prev.totalSearches + responseTime) / (prev.totalSearches + 1),
        popularQueries: [searchQuery, ...prev.popularQueries.filter(q => q !== searchQuery)].slice(0, 10)
      }));

      // Add to search history
      if (searchHistoryRef.current?.addToHistory) {
        searchHistoryRef.current.addToHistory(searchQuery, total || 0, mergedFilters);
      }

    } catch (err) {
      console.error('Search failed:', err);
      toast.error('Search failed. Please try again.');
    }
  }, [search, searchWithOperators, clearResults, total]);

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim().length >= 2) {
        performSearch(query, filters);
      } else {
        clearResults();
      }
    }, 200); // Reduced debounce time for better performance

    return () => clearTimeout(timer);
  }, [query, filters, performSearch, clearResults]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => 
            prev < results.length - 1 ? prev + 1 : prev
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
          break;
        case 'Enter':
          e.preventDefault();
          if (selectedIndex >= 0 && selectedIndex < results.length) {
            handleResultClick(results[selectedIndex]);
          } else if (query.trim()) {
            // Search without selecting a specific result
            performSearch(query, filters);
          }
          break;
        case 'Escape':
          e.preventDefault();
          setIsOpen(false);
          setSelectedIndex(-1);
          inputRef.current?.blur();
          break;
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, selectedIndex, results, query, filters, performSearch]);

  const handleResultClick = (result: any) => {
    navigate(result.path);
    setIsOpen(false);
    setQuery('');
    setSelectedIndex(-1);
    toast.success(`Navigating to ${result.title}`);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setSelectedIndex(-1);
    
    if (value.trim()) {
      setIsOpen(true);
    }
  };

  const handleInputFocus = () => {
    if (query.trim() || results.length > 0) {
      setIsOpen(true);
    }
  };

  const handleClearSearch = () => {
    setQuery('');
    clearResults();
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  const handleSaveSearch = (name: string) => {
    if (searchHistoryRef.current?.saveSearch) {
      searchHistoryRef.current.saveSearch(name, query, filters);
      toast.success(`Search saved as "${name}"`);
    }
  };

  const handleExportResults = () => {
    if (results.length === 0) {
      toast.error('No results to export');
      return;
    }

    const csv = [
      ['Type', 'Title', 'Subtitle', 'Path', 'Created Date'].join(','),
      ...results.map(result => [
        result.type,
        `"${result.title}"`,
        `"${result.subtitle || ''}"`,
        result.path,
        new Date(result.created_at).toLocaleDateString()
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `search-results-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast.success('Results exported successfully');
  };

  const handleSelectSuggestion = (suggestionQuery: string, suggestionFilters?: any) => {
    setQuery(suggestionQuery);
    if (suggestionFilters) {
      setFilters(suggestionFilters);
    }
    performSearch(suggestionQuery, suggestionFilters);
  };

  const handleSelectHistorySearch = (historyQuery: string, historyFilters?: any) => {
    setQuery(historyQuery);
    if (historyFilters) {
      setFilters(historyFilters);
    }
    setShowHistory(false);
    performSearch(historyQuery, historyFilters);
  };

  const getTypeIcon = (type: string) => {
    const icons = {
      association: <Home className="h-5 w-5" />,
      request: <FileText className="h-5 w-5" />,
      lead: <Users className="h-5 w-5" />,
      invoice: <DollarSign className="h-5 w-5" />,
    };
    return icons[type as keyof typeof icons] || <FileText className="h-5 w-5" />;
  };

  const getTypeColor = (type: string) => {
    const colors = {
      association: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
      request: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
      lead: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
      invoice: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300';
  };

  const highlightText = (text: string, searchQuery: string) => {
    if (!searchQuery) return text;
    
    const regex = new RegExp(`(${searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) =>
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 dark:bg-yellow-800 px-0.5 rounded">
          {part}
        </mark>
      ) : (
        <span key={index}>{part}</span>
      )
    );
  };

  return (
    <div className="relative w-full">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="text"
          placeholder="Search anything... (try 'type:invoice status:overdue')"
          value={query}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          className="pl-10 pr-24 h-9 bg-background/60 backdrop-blur-sm border-hoa-blue focus-visible:ring-hoa-blue-200"
        />
        
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
          {/* Analytics Badge */}
          {searchAnalytics.totalSearches > 0 && (
            <Badge variant="secondary" className="text-xs">
              {searchAnalytics.totalSearches} searches
            </Badge>
          )}
          
          {/* Action Buttons */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowHistory(!showHistory)}
            className="h-6 w-6 p-0"
          >
            <History className="h-3 w-3" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="h-6 w-6 p-0"
          >
            <Filter className="h-3 w-3" />
          </Button>
          
          {query && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearSearch}
              className="h-6 w-6 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>

      {/* Search Results Popover */}
      {isOpen && (query.trim() || results.length > 0) && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-background border rounded-md shadow-lg z-50 max-h-96 overflow-hidden">
          <ScrollArea className="max-h-80">
            {/* Loading State */}
            {isLoading && (
              <div className="flex items-center justify-center py-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
                  Searching...
                  {searchAnalytics.avgResponseTime > 0 && (
                    <span className="text-xs">
                      (avg: {Math.round(searchAnalytics.avgResponseTime)}ms)
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="p-4 text-center">
                <div className="text-destructive text-sm mb-2">Search failed</div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => performSearch(query, filters)}
                >
                  Retry
                </Button>
              </div>
            )}

            {/* No Results */}
            {!isLoading && !error && query.trim() && results.length === 0 && (
              <div className="p-4 text-center text-sm text-muted-foreground">
                No results found for "{query}"
                {suggestions && suggestions.length > 0 && (
                  <div className="mt-2">
                    <div className="text-xs mb-1">Did you mean:</div>
                    {suggestions.map((suggestion, index) => (
                      <Button
                        key={index}
                        variant="ghost"
                        size="sm"
                        className="mr-1 mb-1"
                        onClick={() => setQuery(suggestion)}
                      >
                        {suggestion}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Search Results */}
            {results.length > 0 && (
              <div className="p-2">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-muted-foreground">
                    {total} results found
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleExportResults}
                    className="h-6 text-xs"
                  >
                    <Download className="h-3 w-3 mr-1" />
                    Export
                  </Button>
                </div>
                
                {results.map((result, index) => (
                  <div
                    key={result.id}
                    className={`flex items-center gap-3 p-2 rounded-md cursor-pointer transition-colors ${
                      selectedIndex === index ? 'bg-accent' : 'hover:bg-accent/50'
                    }`}
                    onClick={() => handleResultClick(result)}
                  >
                    {getTypeIcon(result.type)}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">
                        {highlightText(result.title, query)}
                      </div>
                      {result.subtitle && (
                        <div className="text-xs text-muted-foreground truncate">
                          {highlightText(result.subtitle, query)}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <Badge variant="secondary" className={`text-xs ${getTypeColor(result.type)}`}>
                        {result.type}
                      </Badge>
                      {result.rank && (
                        <Badge variant="outline" className="text-xs">
                          {result.rank.toFixed(2)}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Smart Suggestions */}
            {query.trim() && !isLoading && (
              <SmartSuggestions
                query={query}
                onSelectSuggestion={handleSelectSuggestion}
                context={{
                  currentPage: window.location.pathname,
                  recentActivity: searchAnalytics.popularQueries
                }}
              />
            )}
          </ScrollArea>
        </div>
      )}

      {/* Advanced Filters Panel */}
      {showFilters && (
        <div className="absolute top-full left-0 right-0 mt-1 z-40">
          <AdvancedSearchFilters
            filters={filters}
            onFiltersChange={setFilters}
            onSaveSearch={handleSaveSearch}
            onExportResults={handleExportResults}
            isOpen={showFilters}
            onToggle={() => setShowFilters(!showFilters)}
          />
        </div>
      )}

      {/* Search History Panel */}
      {showHistory && (
        <div className="absolute top-full right-0 mt-1 w-80 z-40">
          <SearchHistory
            ref={searchHistoryRef}
            onSelectSearch={handleSelectHistorySearch}
            currentQuery={query}
          />
        </div>
      )}
    </div>
  );
};

export default InlineGlobalSearch;
