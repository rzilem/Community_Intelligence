
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, Clock, Home, FileText, Users, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNavigate } from 'react-router-dom';
import { useOptimizedGlobalSearch } from '@/hooks/search/useOptimizedGlobalSearch';
import SearchHistory from '@/components/search/SearchHistory';
import SmartSuggestions from '@/components/search/SmartSuggestions';

const InlineGlobalSearch: React.FC = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const searchHistoryRef = useRef<any>(null);

  const {
    results,
    isLoading,
    handleResultSelect,
    isDebouncing,
    hasMinLength
  } = useOptimizedGlobalSearch(query);

  // Close search when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setHighlightedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setHighlightedIndex(prev => 
            prev < results.length - 1 ? prev + 1 : prev
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setHighlightedIndex(prev => prev > 0 ? prev - 1 : -1);
          break;
        case 'Enter':
          e.preventDefault();
          if (highlightedIndex >= 0 && results[highlightedIndex]) {
            handleResultClick(results[highlightedIndex]);
          }
          break;
        case 'Escape':
          e.preventDefault();
          setIsOpen(false);
          setHighlightedIndex(-1);
          inputRef.current?.blur();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, results, highlightedIndex]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setIsOpen(true);
    setHighlightedIndex(-1);
  };

  const handleInputFocus = () => {
    setIsOpen(true);
  };

  const handleResultClick = useCallback((result: any) => {
    handleResultSelect(result);
    setQuery('');
    setIsOpen(false);
    setHighlightedIndex(-1);
    
    // Add to search history
    if (searchHistoryRef.current) {
      searchHistoryRef.current.addToHistory(query, results.length);
    }
  }, [handleResultSelect, query, results.length]);

  const handleSearchSelect = (searchQuery: string, filters?: any) => {
    setQuery(searchQuery);
    setIsOpen(true);
    inputRef.current?.focus();
  };

  const handleSuggestionSelect = (suggestionQuery: string, filters?: any) => {
    setQuery(suggestionQuery);
    setIsOpen(true);
    inputRef.current?.focus();
  };

  const getResultIcon = (type: string) => {
    switch (type) {
      case 'association':
        return <Home className="h-4 w-4" />;
      case 'invoice':
        return <DollarSign className="h-4 w-4" />;
      case 'request':
        return <FileText className="h-4 w-4" />;
      case 'lead':
        return <Users className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    const colors = {
      association: 'bg-blue-100 text-blue-700',
      invoice: 'bg-green-100 text-green-700',
      request: 'bg-orange-100 text-orange-700',
      lead: 'bg-purple-100 text-purple-700',
      property: 'bg-gray-100 text-gray-700',
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-700';
  };

  const highlightMatch = (text: string, query: string) => {
    if (!query.trim()) return text;
    
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 text-black">
          {part}
        </mark>
      ) : part
    );
  };

  const showResults = isOpen && (hasMinLength || query.length === 0);
  const showLoading = isLoading || isDebouncing;

  return (
    <div ref={searchRef} className="relative w-full max-w-4xl">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="text"
          placeholder="Search everything... (Ctrl+K)"
          value={query}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          className="pl-10 pr-4 w-full bg-background/60 backdrop-blur-sm border-hoa-blue text-foreground placeholder:text-muted-foreground hover:bg-background/80"
        />
      </div>

      {showResults && (
        <Card className="absolute top-full left-0 right-0 mt-1 z-50 shadow-lg border">
          <CardContent className="p-0">
            <ScrollArea className="max-h-96">
              {/* Search History */}
              {query.length === 0 && (
                <div className="p-2">
                  <SearchHistory
                    onSelectSearch={handleSearchSelect}
                    currentQuery={query}
                    ref={searchHistoryRef}
                  />
                </div>
              )}

              {/* Smart Suggestions */}
              {query.length >= 2 && (
                <SmartSuggestions
                  query={query}
                  onSelectSuggestion={handleSuggestionSelect}
                  context={{
                    currentPage: window.location.pathname,
                    userRole: 'admin'
                  }}
                />
              )}

              {/* Loading State */}
              {showLoading && hasMinLength && (
                <div className="p-4 text-center text-muted-foreground">
                  <div className="flex items-center justify-center gap-2">
                    <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                    Searching...
                  </div>
                </div>
              )}

              {/* Search Results */}
              {!showLoading && hasMinLength && results.length > 0 && (
                <div className="p-2">
                  <div className="text-xs font-medium text-muted-foreground mb-2 px-2">
                    Search Results ({results.length})
                  </div>
                  <div className="space-y-1">
                    {results.map((result, index) => (
                      <div
                        key={result.id}
                        className={`flex items-center justify-between p-3 rounded-md cursor-pointer transition-colors ${
                          index === highlightedIndex
                            ? 'bg-accent'
                            : 'hover:bg-accent/50'
                        }`}
                        onClick={() => handleResultClick(result)}
                      >
                        <div className="flex items-center gap-3 flex-1">
                          {getResultIcon(result.type)}
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
                        <Badge variant="secondary" className={`text-xs ${getTypeColor(result.type)}`}>
                          {result.type}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* No Results */}
              {!showLoading && hasMinLength && results.length === 0 && (
                <div className="p-4 text-center text-muted-foreground">
                  <div className="text-sm">No results found for "{query}"</div>
                  <div className="text-xs mt-1">Try different keywords or check spelling</div>
                </div>
              )}

              {/* Quick Tips */}
              {query.length === 0 && (
                <div className="p-4 border-t bg-muted/30">
                  <div className="text-xs text-muted-foreground">
                    <div className="font-medium mb-2">Quick Tips:</div>
                    <div className="space-y-1">
                      <div>• Use "type:invoice" to search only invoices</div>
                      <div>• Use "status:open" to filter by status</div>
                      <div>• Use "after:2024-01-01" for date ranges</div>
                    </div>
                  </div>
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default InlineGlobalSearch;
