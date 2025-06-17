import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Clock, FileText, Users, Home, DollarSign, Zap, AlertCircle } from 'lucide-react';
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
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
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

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      if (search.trim().length >= 2) {
        if (search.includes(':')) {
          searchWithOperators(search);
        } else {
          performSearch(search);
        }
      } else {
        clearResults();
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [search, performSearch, searchWithOperators, clearResults]);

  // Handle focus/blur to show/hide dropdown
  useEffect(() => {
    const handleFocus = () => setIsOpen(true);
    const handleBlur = (e: FocusEvent) => {
      // Don't close if clicking within the dropdown
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

  // Keyboard shortcut Ctrl/Cmd + K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Show error toast
  useEffect(() => {
    if (error) {
      toast.error(`Search failed: ${error}`);
    }
  }, [error]);

  const handleSelect = useCallback((path: string, title: string) => {
    navigate(path);
    setIsOpen(false);
    setSearch('');
    
    // Add to recent searches
    setRecentSearches(prev => {
      const newSearches = [title, ...prev.filter(s => s !== title)].slice(0, 5);
      return newSearches;
    });
  }, [navigate]);

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
          placeholder="Search anything..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-12 w-full bg-background/60 backdrop-blur-sm border-hoa-blue text-base pl-12 pr-4"
        />
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
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-center justify-center py-8">
              <div className="flex items-center gap-3 text-base text-destructive">
                <AlertCircle className="h-5 w-5" />
                Search failed. Please try again.
              </div>
            </div>
          )}

          {!search && recentSearches.length > 0 && (
            <div className="p-4">
              <div className="text-sm font-medium text-muted-foreground mb-3 px-2">Recent Searches</div>
              {recentSearches.map((recent, index) => (
                <div 
                  key={index} 
                  className="flex items-center gap-3 px-3 py-3 hover:bg-accent rounded-sm cursor-pointer text-base"
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
              {items.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleSelect(item.path, item.title)}
                  className="flex items-center justify-between py-3 px-3 hover:bg-accent rounded-sm cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    {getTypeIcon(item.type)}
                    <div>
                      <div className="font-medium text-base">{item.title}</div>
                      {item.subtitle && (
                        <div className="text-sm text-muted-foreground">{item.subtitle}</div>
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
              ))}
            </div>
          ))}

          {search && total > 0 && (
            <div className="px-6 py-3 text-sm text-muted-foreground border-t bg-muted/50">
              Showing {results.length} of {total} results for "{search}"
              {hasSearchOperators && <Badge variant="outline" className="ml-2 text-sm">Advanced Search</Badge>}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default InlineGlobalSearch;
