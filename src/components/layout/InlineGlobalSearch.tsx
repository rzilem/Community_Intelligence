
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Clock, FileText, Users, Home, DollarSign, Zap, AlertCircle, TrendingUp } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useServerSearch } from '@/hooks/search/useServerSearch';
import { toast } from 'sonner';

const InlineGlobalSearch: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [searchAnalytics, setSearchAnalytics] = useState({ searches: 0, avgTime: 0 });
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchStartTime = useRef<number>(0);
  
  const { 
    results, 
    isLoading, 
    error, 
    search: performSearch, 
    searchWithOperators,
    total,
    suggestions,
    clearResults 
  } = useServerSearch();

  // Performance optimized debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (search.trim().length >= 2) {
        searchStartTime.current = Date.now();
        if (search.includes(':')) {
          searchWithOperators(search);
        } else {
          performSearch(search);
        }
        
        // Track search analytics
        setSearchAnalytics(prev => ({
          searches: prev.searches + 1,
          avgTime: prev.avgTime
        }));
      } else {
        clearResults();
      }
    }, 200); // Reduced debounce for better responsiveness

    return () => clearTimeout(timer);
  }, [search, performSearch, searchWithOperators, clearResults]);

  // Track search completion time
  useEffect(() => {
    if (!isLoading && results.length > 0 && searchStartTime.current > 0) {
      const searchTime = Date.now() - searchStartTime.current;
      setSearchAnalytics(prev => ({
        ...prev,
        avgTime: (prev.avgTime + searchTime) / 2
      }));
      searchStartTime.current = 0;
    }
  }, [isLoading, results]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => {
            const maxIndex = results.length + (recentSearches.length > 0 ? recentSearches.length : 0) - 1;
            return prev < maxIndex ? prev + 1 : 0;
          });
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => {
            const maxIndex = results.length + (recentSearches.length > 0 ? recentSearches.length : 0) - 1;
            return prev > 0 ? prev - 1 : maxIndex;
          });
          break;
        case 'Enter':
          e.preventDefault();
          if (selectedIndex >= 0) {
            if (!search && selectedIndex < recentSearches.length) {
              setSearch(recentSearches[selectedIndex]);
            } else if (results.length > 0) {
              const result = results[selectedIndex];
              if (result) {
                handleSelect(result.path, result.title);
              }
            }
          }
          break;
        case 'Escape':
          e.preventDefault();
          setIsOpen(false);
          inputRef.current?.blur();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, results, recentSearches, search]);

  // Global keyboard shortcut
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    document.addEventListener('keydown', handleGlobalKeyDown);
    return () => document.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  // Focus management
  useEffect(() => {
    const handleFocus = () => {
      setIsOpen(true);
      setSelectedIndex(-1);
    };
    
    const handleBlur = (e: FocusEvent) => {
      if (dropdownRef.current && dropdownRef.current.contains(e.relatedTarget as Node)) {
        return;
      }
      setTimeout(() => setIsOpen(false), 150);
    };

    const input = inputRef.current;
    if (input) {
      input.addEventListener('focus', handleFocus);
      input.addEventListener('blur', handleBlur);
    }

    return () => {
      if (input) {
        input.removeEventListener('focus', handleFocus);
        input.removeEventListener('blur', handleBlur);
      }
    };
  }, []);

  // Error handling with toast
  useEffect(() => {
    if (error) {
      toast.error(`Search failed: ${error}`);
    }
  }, [error]);

  const handleSelect = useCallback((path: string, title: string) => {
    navigate(path);
    setIsOpen(false);
    setSearch('');
    setSelectedIndex(-1);
    
    // Add to recent searches with deduplication
    setRecentSearches(prev => {
      const newSearches = [title, ...prev.filter(s => s !== title)].slice(0, 5);
      return newSearches;
    });
  }, [navigate]);

  // Highlight matched terms in results
  const highlightMatch = useCallback((text: string, query: string) => {
    if (!query) return text;
    
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 dark:bg-yellow-800 rounded px-1">
          {part}
        </mark>
      ) : part
    );
  }, []);

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

  const groupedResults = useMemo(() => {
    const groups: { [key: string]: typeof results } = {};
    results.forEach(result => {
      if (!groups[result.type]) {
        groups[result.type] = [];
      }
      groups[result.type].push(result);
    });
    return groups;
  }, [results]);

  const hasSearchOperators = search.includes(':');
  const shouldShowDropdown = isOpen && (search.length >= 2 || recentSearches.length > 0);

  return (
    <div className="relative w-full">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="text"
          placeholder="Search anything... (Ctrl+K)"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-12 w-full bg-background/60 backdrop-blur-sm border-hoa-blue text-base pl-12 pr-4"
        />
        {searchAnalytics.searches > 0 && (
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
            <Badge variant="outline" className="text-xs">
              <TrendingUp className="h-3 w-3 mr-1" />
              {searchAnalytics.searches} searches
            </Badge>
          </div>
        )}
      </div>

      {shouldShowDropdown && (
        <div 
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 mt-1 bg-background border rounded-md shadow-lg z-50 max-h-[600px] overflow-y-auto"
        >
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <div className="flex items-center gap-3 text-base text-muted-foreground">
                <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full" />
                Searching...
                {searchAnalytics.avgTime > 0 && (
                  <span className="text-sm">~{Math.round(searchAnalytics.avgTime)}ms</span>
                )}
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-center justify-center py-8">
              <div className="flex items-center gap-3 text-base text-destructive">
                <AlertCircle className="h-5 w-5" />
                Search failed. Please try again.
                <Button variant="ghost" size="sm" onClick={() => window.location.reload()}>
                  Retry
                </Button>
              </div>
            </div>
          )}

          {!search && recentSearches.length > 0 && (
            <div className="p-4">
              <div className="text-sm font-medium text-muted-foreground mb-3 px-2">Recent Searches</div>
              {recentSearches.map((recent, index) => (
                <div 
                  key={index} 
                  className={`flex items-center gap-3 px-3 py-3 hover:bg-accent rounded-sm cursor-pointer text-base ${
                    selectedIndex === index ? 'bg-accent' : ''
                  }`}
                  onClick={() => setSearch(recent)}
                >
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  {recent}
                </div>
              ))}
            </div>
          )}

          {!search && (
            <div className="p-4">
              <div className="text-sm font-medium text-muted-foreground mb-3 px-2">Search Tips</div>
              <div className="flex items-center gap-3 text-muted-foreground px-3 py-2 text-base">
                <Zap className="h-5 w-5" />
                Use "type:invoice" to search only invoices
              </div>
              <div className="flex items-center gap-3 text-muted-foreground px-3 py-2 text-base">
                <Zap className="h-5 w-5" />
                Use "after:2024-01-01" to filter by date
              </div>
            </div>
          )}

          {search && results.length === 0 && !isLoading && !error && (
            <div className="p-6 text-center">
              <div className="text-base text-muted-foreground">
                No results found for "{search}".
                {suggestions && suggestions.length > 0 && (
                  <div className="mt-3">
                    <p className="text-base text-muted-foreground">Did you mean:</p>
                    {suggestions.map((suggestion, index) => (
                      <Button 
                        key={index}
                        variant="ghost" 
                        size="sm"
                        className="mt-2 mr-2"
                        onClick={() => setSearch(suggestion)}
                      >
                        {suggestion}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
          
          {Object.entries(groupedResults).map(([type, items]) => (
            <div key={type} className="p-4">
              <div className="text-sm font-medium text-muted-foreground mb-3 px-2">
                {type.charAt(0).toUpperCase() + type.slice(1)}s ({items.length})
              </div>
              {items.map((item, itemIndex) => {
                const globalIndex = Object.entries(groupedResults)
                  .slice(0, Object.keys(groupedResults).indexOf(type))
                  .reduce((acc, [, prevItems]) => acc + prevItems.length, 0) + itemIndex;
                
                return (
                  <div
                    key={item.id}
                    onClick={() => handleSelect(item.path, item.title)}
                    className={`flex items-center justify-between py-3 px-3 hover:bg-accent rounded-sm cursor-pointer ${
                      selectedIndex === globalIndex ? 'bg-accent' : ''
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      {getTypeIcon(item.type)}
                      <div>
                        <div className="font-medium text-base">
                          {highlightMatch(item.title, search)}
                        </div>
                        {item.subtitle && (
                          <div className="text-sm text-muted-foreground">
                            {highlightMatch(item.subtitle, search)}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {hasSearchOperators && (
                        <Badge variant="outline" className="text-sm">
                          {item.rank.toFixed(2)}
                        </Badge>
                      )}
                      <Badge variant="secondary" className={`text-sm ${getTypeColor(item.type)}`}>
                        {item.type}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}

          {search && total > 0 && (
            <div className="px-6 py-3 text-sm text-muted-foreground border-t bg-muted/50 flex items-center justify-between">
              <span>
                Showing {results.length} of {total} results for "{search}"
                {hasSearchOperators && <Badge variant="outline" className="ml-2 text-sm">Advanced Search</Badge>}
              </span>
              {searchAnalytics.avgTime > 0 && (
                <span className="text-xs">
                  Avg: {Math.round(searchAnalytics.avgTime)}ms
                </span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default InlineGlobalSearch;
