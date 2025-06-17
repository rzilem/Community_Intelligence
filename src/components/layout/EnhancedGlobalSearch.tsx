import React, { useState, useRef, useEffect } from 'react';
import { Search, Clock, Users, FileText, Home, DollarSign, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useOptimizedGlobalSearch, SearchResult } from '@/hooks/search/useOptimizedGlobalSearch';
import { useSearchCache } from '@/hooks/search/useSearchCache';

const getTypeIcon = (type: string) => {
  const icons = {
    association: <Home className="h-4 w-4" />,
    owner: <Users className="h-4 w-4" />,
    lead: <Users className="h-4 w-4" />,
    invoice: <DollarSign className="h-4 w-4" />,
    request: <AlertCircle className="h-4 w-4" />,
    property: <Home className="h-4 w-4" />,
  };
  return icons[type as keyof typeof icons] || <FileText className="h-4 w-4" />;
};

const getTypeColor = (type: string) => {
  const colors = {
    association: 'bg-blue-100 text-blue-700',
    owner: 'bg-green-100 text-green-700',
    lead: 'bg-purple-100 text-purple-700',
    invoice: 'bg-yellow-100 text-yellow-700',
    request: 'bg-red-100 text-red-700',
    property: 'bg-orange-100 text-orange-700',
  };
  return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-700';
};

const highlightMatch = (text: string, query: string) => {
  if (!query) return text;
  
  const regex = new RegExp(`(${query})`, 'gi');
  const parts = text.split(regex);
  
  return (
    <>
      {parts.map((part, index) =>
        regex.test(part) ? (
          <mark key={index} className="bg-yellow-200 dark:bg-yellow-800 px-0.5 rounded">
            {part}
          </mark>
        ) : (
          <span key={index}>{part}</span>
        )
      )}
    </>
  );
};

const getLoadingStateIndicator = (isLoaded: boolean, isLoading: boolean, hasResults: boolean) => {
  if (isLoading) {
    return <Loader2 className="h-3 w-3 animate-spin text-blue-500" />;
  }
  if (isLoaded && hasResults) {
    return <CheckCircle2 className="h-3 w-3 text-green-500" />;
  }
  if (isLoaded && !hasResults) {
    return <div className="h-3 w-3 rounded-full bg-gray-300" />;
  }
  return <div className="h-3 w-3 rounded-full bg-gray-200" />;
};

const EnhancedGlobalSearch: React.FC = () => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const { 
    results, 
    isLoading, 
    handleResultSelect, 
    isDebouncing, 
    hasMinLength,
    categoryStatus,
    loadingProgress,
    hasAnyData
  } = useOptimizedGlobalSearch(query);
  
  const { 
    recentSearches, 
    addToRecentSearches 
  } = useSearchCache();

  // Keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, -1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && results[selectedIndex]) {
        handleSelect(results[selectedIndex]);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  const handleSelect = (result: SearchResult) => {
    handleResultSelect(result);
    setQuery('');
    setIsOpen(false);
    setSelectedIndex(-1);
    
    // Add to recent searches
    addToRecentSearches(result.title);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setSelectedIndex(-1);
    setIsOpen(value.length > 0 || isOpen);
  };

  const showRecentSearches = isOpen && query.length === 0 && recentSearches.length > 0;
  const showResults = isOpen && hasMinLength;
  const showDebouncing = isDebouncing && query.length >= 2;

  return (
    <div className="relative">
      <Popover open={showResults || showRecentSearches} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            {showDebouncing && (
              <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
            )}
            <Input
              ref={inputRef}
              value={query}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsOpen(true)}
              placeholder="Search anything..."
              className="pl-10 pr-4 h-9 w-full min-w-[400px] lg:min-w-[600px] border-hoa-blue bg-background/60 backdrop-blur-sm text-sm"
            />
          </div>
        </PopoverTrigger>
        
        {(showResults || showRecentSearches) && (
          <PopoverContent 
            className="w-[400px] lg:w-[600px] p-0 mt-1" 
            align="start"
            side="bottom"
          >
            <div className="max-h-[400px] overflow-y-auto">
              {/* Recent Searches */}
              {showRecentSearches && (
                <div className="p-2">
                  <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                    Recent Searches
                  </div>
                  {recentSearches.map((recent, index) => (
                    <Button
                      key={index}
                      variant="ghost"
                      className="w-full justify-start h-8 px-2 text-sm"
                      onClick={() => {
                        setQuery(recent);
                        setIsOpen(true);
                      }}
                    >
                      <Clock className="mr-2 h-3 w-3 text-muted-foreground" />
                      {recent}
                    </Button>
                  ))}
                </div>
              )}
              
              {/* Search Results */}
              {showResults && (
                <div className="p-2">
                  {/* Progressive Loading Status */}
                  {hasMinLength && (isLoading || hasAnyData) && (
                    <div className="px-2 py-2 border-b">
                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                        <span>Search Progress</span>
                        <span>{Math.round(loadingProgress * 100)}%</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs">
                        <div className="flex items-center gap-1">
                          {getLoadingStateIndicator(
                            categoryStatus.associations.loaded, 
                            !categoryStatus.associations.loaded, 
                            categoryStatus.associations.hasResults
                          )}
                          <span>Associations</span>
                        </div>
                        <div className="flex items-center gap-1">
                          {getLoadingStateIndicator(
                            categoryStatus.requests.loaded, 
                            !categoryStatus.requests.loaded, 
                            categoryStatus.requests.hasResults
                          )}
                          <span>Requests</span>
                        </div>
                        <div className="flex items-center gap-1">
                          {getLoadingStateIndicator(
                            categoryStatus.leads.loaded, 
                            !categoryStatus.leads.loaded, 
                            categoryStatus.leads.hasResults
                          )}
                          <span>Leads</span>
                        </div>
                        <div className="flex items-center gap-1">
                          {getLoadingStateIndicator(
                            categoryStatus.invoices.loaded, 
                            !categoryStatus.invoices.loaded, 
                            categoryStatus.invoices.hasResults
                          )}
                          <span>Invoices</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {hasMinLength && results.length === 0 && !isLoading && !isDebouncing && (
                    <div className="px-2 py-6 text-center text-sm text-muted-foreground">
                      No results found for "{query}"
                    </div>
                  )}
                  
                  {isDebouncing && (
                    <div className="px-2 py-6 text-center text-sm text-muted-foreground flex items-center justify-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Searching...
                    </div>
                  )}
                  
                  {results.length > 0 && (
                    <>
                      <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                        Results ({results.length})
                      </div>
                      {results.map((result, index) => (
                        <Button
                          key={result.id}
                          variant="ghost"
                          className={cn(
                            "w-full justify-between h-auto p-2 text-left",
                            selectedIndex === index && "bg-accent"
                          )}
                          onClick={() => handleSelect(result)}
                          onMouseEnter={() => setSelectedIndex(index)}
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className="flex items-center justify-center w-8 h-8 rounded-md bg-muted shrink-0">
                              {getTypeIcon(result.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-sm truncate">
                                {highlightMatch(result.title, query)}
                              </div>
                              {result.subtitle && (
                                <div className="text-xs text-muted-foreground truncate">
                                  {highlightMatch(result.subtitle, query)}
                                </div>
                              )}
                            </div>
                          </div>
                          <Badge 
                            variant="secondary" 
                            className={cn("text-xs shrink-0", getTypeColor(result.type))}
                          >
                            {result.type}
                          </Badge>
                        </Button>
                      ))}
                    </>
                  )}
                </div>
              )}
            </div>
          </PopoverContent>
        )}
      </Popover>
    </div>
  );
};

export default EnhancedGlobalSearch;
