
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Star, Trash2, Search } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface SearchHistoryItem {
  id: string;
  query: string;
  timestamp: Date;
  resultCount: number;
  filters?: any;
}

interface SavedSearch {
  id: string;
  name: string;
  query: string;
  filters: any;
  createdAt: Date;
  lastUsed?: Date;
}

interface SearchHistoryProps {
  onSelectSearch: (query: string, filters?: any) => void;
  currentQuery?: string;
}

const SearchHistory = React.forwardRef<any, SearchHistoryProps>(({
  onSelectSearch,
  currentQuery
}, ref) => {
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);

  // Load data from localStorage on mount
  useEffect(() => {
    const history = localStorage.getItem('search-history');
    const saved = localStorage.getItem('saved-searches');
    
    if (history) {
      setSearchHistory(JSON.parse(history).map((item: any) => ({
        ...item,
        timestamp: new Date(item.timestamp)
      })));
    }
    
    if (saved) {
      setSavedSearches(JSON.parse(saved).map((item: any) => ({
        ...item,
        createdAt: new Date(item.createdAt),
        lastUsed: item.lastUsed ? new Date(item.lastUsed) : undefined
      })));
    }
  }, []);

  // Save search history to localStorage
  const saveSearchHistory = (history: SearchHistoryItem[]) => {
    localStorage.setItem('search-history', JSON.stringify(history));
    setSearchHistory(history);
  };

  // Save saved searches to localStorage
  const saveSavedSearches = (searches: SavedSearch[]) => {
    localStorage.setItem('saved-searches', JSON.stringify(searches));
    setSavedSearches(searches);
  };

  // Add to search history
  const addToHistory = (query: string, resultCount: number, filters?: any) => {
    const newItem: SearchHistoryItem = {
      id: Date.now().toString(),
      query,
      timestamp: new Date(),
      resultCount,
      filters
    };

    const updatedHistory = [newItem, ...searchHistory.filter(item => item.query !== query)]
      .slice(0, 20); // Keep only last 20 searches

    saveSearchHistory(updatedHistory);
  };

  // Save a search
  const saveSearch = (name: string, query: string, filters: any) => {
    const newSaved: SavedSearch = {
      id: Date.now().toString(),
      name,
      query,
      filters,
      createdAt: new Date()
    };

    const updatedSaved = [newSaved, ...savedSearches];
    saveSavedSearches(updatedSaved);
  };

  // Delete from history
  const deleteFromHistory = (id: string) => {
    const updatedHistory = searchHistory.filter(item => item.id !== id);
    saveSearchHistory(updatedHistory);
  };

  // Delete saved search
  const deleteSavedSearch = (id: string) => {
    const updatedSaved = savedSearches.filter(item => item.id !== id);
    saveSavedSearches(updatedSaved);
  };

  // Use saved search
  const useSavedSearch = (search: SavedSearch) => {
    const updatedSearch = { ...search, lastUsed: new Date() };
    const updatedSaved = savedSearches.map(s => s.id === search.id ? updatedSearch : s);
    saveSavedSearches(updatedSaved);
    onSelectSearch(search.query, search.filters);
  };

  // Format time
  const formatTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  // Expose methods via ref
  React.useImperativeHandle(ref, () => ({
    addToHistory,
    saveSearch
  }));

  return (
    <div className="space-y-4">
      {/* Saved Searches */}
      {savedSearches.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Star className="h-4 w-4" />
              Saved Searches
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-32">
              <div className="space-y-2">
                {savedSearches.map((search) => (
                  <div
                    key={search.id}
                    className="flex items-center justify-between p-2 rounded hover:bg-muted cursor-pointer"
                    onClick={() => useSavedSearch(search)}
                  >
                    <div className="flex-1">
                      <div className="font-medium text-sm">{search.name}</div>
                      <div className="text-xs text-muted-foreground truncate">
                        {search.query}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteSavedSearch(search.id);
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Recent Searches */}
      {searchHistory.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Recent Searches
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-48">
              <div className="space-y-2">
                {searchHistory.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-2 rounded hover:bg-muted cursor-pointer"
                    onClick={() => onSelectSearch(item.query, item.filters)}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Search className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm">{item.query}</span>
                        <Badge variant="secondary" className="text-xs">
                          {item.resultCount}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground ml-5">
                        {formatTime(item.timestamp)}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteFromHistory(item.id);
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
});

SearchHistory.displayName = 'SearchHistory';

export default SearchHistory;
