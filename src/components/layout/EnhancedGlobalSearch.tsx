
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Clock, FileText, Users, Home, DollarSign, Zap, AlertCircle } from 'lucide-react';
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandGroup,
  CommandItem,
  CommandEmpty,
  CommandSeparator,
} from '@/components/ui/command';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useServerSearch } from '@/hooks/search/useServerSearch';
import { toast } from 'sonner';

const EnhancedGlobalSearch: React.FC = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  
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

  // Keyboard shortcut Ctrl/Cmd + K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen(true);
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
    setOpen(false);
    setSearch('');
    
    // Add to recent searches
    setRecentSearches(prev => {
      const newSearches = [title, ...prev.filter(s => s !== title)].slice(0, 5);
      return newSearches;
    });
  }, [navigate]);

  const getTypeIcon = (type: string) => {
    const icons = {
      association: <Home className="h-4 w-4" />,
      request: <FileText className="h-4 w-4" />,
      lead: <Users className="h-4 w-4" />,
      invoice: <DollarSign className="h-4 w-4" />,
    };
    return icons[type as keyof typeof icons] || <FileText className="h-4 w-4" />;
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

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setOpen(true)}
        className="relative h-9 w-full bg-background/60 backdrop-blur-sm border-hoa-blue text-muted-foreground hover:bg-background/80 justify-start text-sm font-normal shadow-sm min-w-[200px] md:min-w-[300px]"
      >
        <Search className="mr-2 h-4 w-4" />
        <span className="hidden lg:inline-flex">Search anything...</span>
        <span className="inline-flex lg:hidden">Search...</span>
        <kbd className="pointer-events-none absolute right-1.5 top-1.5 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput 
          placeholder="Search pages, owners, leads, invoices... Try 'type:invoice' or 'after:2024-01-01'" 
          value={search}
          onValueChange={setSearch}
        />
        <CommandList>
          {isLoading && (
            <div className="flex items-center justify-center py-6">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
                Searching...
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-center justify-center py-6">
              <div className="flex items-center gap-2 text-sm text-destructive">
                <AlertCircle className="h-4 w-4" />
                Search failed. Please try again.
              </div>
            </div>
          )}

          {!search && !isLoading && recentSearches.length > 0 && (
            <CommandGroup heading="Recent Searches">
              {recentSearches.map((recent, index) => (
                <CommandItem 
                  key={index} 
                  className="flex items-center gap-2"
                  onSelect={() => setSearch(recent)}
                >
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  {recent}
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {!search && !isLoading && (
            <CommandGroup heading="Search Tips">
              <CommandItem className="flex items-center gap-2 text-muted-foreground">
                <Zap className="h-4 w-4" />
                Use "type:invoice" to search only invoices
              </CommandItem>
              <CommandItem className="flex items-center gap-2 text-muted-foreground">
                <Zap className="h-4 w-4" />
                Use "after:2024-01-01" to filter by date
              </CommandItem>
            </CommandGroup>
          )}

          {search && !isLoading && results.length === 0 && !error && (
            <CommandEmpty>
              No results found for "{search}".
              {suggestions && suggestions.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm text-muted-foreground">Did you mean:</p>
                  {suggestions.map((suggestion, index) => (
                    <Button 
                      key={index}
                      variant="ghost" 
                      size="sm"
                      className="mt-1 mr-2"
                      onClick={() => setSearch(suggestion)}
                    >
                      {suggestion}
                    </Button>
                  ))}
                </div>
              )}
            </CommandEmpty>
          )}
          
          {Object.entries(groupedResults).map(([type, items]) => (
            <React.Fragment key={type}>
              <CommandGroup heading={`${type.charAt(0).toUpperCase() + type.slice(1)}s (${items.length})`}>
                {items.map((item) => (
                  <CommandItem
                    key={item.id}
                    onSelect={() => handleSelect(item.path, item.title)}
                    className="flex items-center justify-between py-3"
                  >
                    <div className="flex items-center gap-3">
                      {getTypeIcon(item.type)}
                      <div>
                        <div className="font-medium">{item.title}</div>
                        {item.subtitle && (
                          <div className="text-sm text-muted-foreground">{item.subtitle}</div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {hasSearchOperators && (
                        <Badge variant="outline" className="text-xs">
                          {item.rank.toFixed(2)}
                        </Badge>
                      )}
                      <Badge variant="secondary" className={`text-xs ${getTypeColor(item.type)}`}>
                        {item.type}
                      </Badge>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
              <CommandSeparator />
            </React.Fragment>
          ))}

          {search && total > 0 && (
            <div className="px-2 py-1 text-xs text-muted-foreground border-t">
              Showing {results.length} of {total} results for "{search}"
              {hasSearchOperators && <Badge variant="outline" className="ml-2">Advanced Search</Badge>}
            </div>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
};

export default EnhancedGlobalSearch;
