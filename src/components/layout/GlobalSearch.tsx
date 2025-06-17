
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Clock, FileText, Users, Home, DollarSign } from 'lucide-react';
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

interface SearchItem {
  id: string;
  title: string;
  subtitle?: string;
  type: 'page' | 'homeowner' | 'lead' | 'invoice' | 'document' | 'property';
  path: string;
  icon: React.ReactNode;
}

const GlobalSearch: React.FC = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  // Mock data for demonstration - in real app, this would come from API
  const searchableItems = useMemo<SearchItem[]>(() => [
    // Pages
    { id: 'dashboard', title: 'Dashboard', type: 'page', path: '/dashboard', icon: <Home className="h-4 w-4" /> },
    { id: 'homeowners', title: 'Owners', type: 'page', path: '/homeowners', icon: <Users className="h-4 w-4" /> },
    { id: 'leads', title: 'Leads', type: 'page', path: '/leads', icon: <Users className="h-4 w-4" /> },
    { id: 'invoices', title: 'Invoices', type: 'page', path: '/invoices', icon: <FileText className="h-4 w-4" /> },
    { id: 'documents', title: 'Documents', type: 'page', path: '/records-reports/documents', icon: <FileText className="h-4 w-4" /> },
    { id: 'associations', title: 'Associations', type: 'page', path: '/associations', icon: <Home className="h-4 w-4" /> },
    
    // Sample homeowners
    { id: 'homeowner-1', title: 'John Smith', subtitle: '123 Oak Street', type: 'homeowner', path: '/homeowners/1', icon: <Users className="h-4 w-4" /> },
    { id: 'homeowner-2', title: 'Sarah Johnson', subtitle: '456 Pine Avenue', type: 'homeowner', path: '/homeowners/2', icon: <Users className="h-4 w-4" /> },
    
    // Sample leads
    { id: 'lead-1', title: 'Mike Wilson', subtitle: 'New lead inquiry', type: 'lead', path: '/leads/1', icon: <Users className="h-4 w-4" /> },
    
    // Sample invoices
    { id: 'invoice-1', title: 'Invoice #001', subtitle: '$1,250.00', type: 'invoice', path: '/invoices/1', icon: <DollarSign className="h-4 w-4" /> },
  ], []);

  // Filter results based on search
  const filteredItems = useMemo(() => {
    if (!search) return [];
    const query = search.toLowerCase();
    return searchableItems.filter(item => 
      item.title.toLowerCase().includes(query) || 
      item.subtitle?.toLowerCase().includes(query)
    );
  }, [search, searchableItems]);

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

  const handleSelect = useCallback((item: SearchItem) => {
    navigate(item.path);
    setOpen(false);
    setSearch('');
    
    // Add to recent searches
    setRecentSearches(prev => {
      const newSearches = [item.title, ...prev.filter(s => s !== item.title)].slice(0, 5);
      return newSearches;
    });
  }, [navigate]);

  const getTypeColor = (type: string) => {
    const colors = {
      page: 'bg-blue-100 text-blue-700',
      homeowner: 'bg-green-100 text-green-700',
      lead: 'bg-purple-100 text-purple-700',
      invoice: 'bg-yellow-100 text-yellow-700',
      document: 'bg-gray-100 text-gray-700',
      property: 'bg-orange-100 text-orange-700',
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-700';
  };

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setOpen(true)}
        className="relative h-9 w-full bg-background/60 backdrop-blur-sm border-hoa-blue text-muted-foreground hover:bg-background/80 justify-start text-sm font-normal shadow-sm"
      >
        <Search className="mr-2 h-4 w-4" />
        <span className="hidden lg:inline-flex">Search anything...</span>
        <span className="inline-flex lg:hidden">Search...</span>
      </Button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput 
          placeholder="Search pages, owners, leads, invoices..." 
          value={search}
          onValueChange={setSearch}
        />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          
          {recentSearches.length > 0 && !search && (
            <CommandGroup heading="Recent Searches">
              {recentSearches.map((recent, index) => (
                <CommandItem key={index} className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  {recent}
                </CommandItem>
              ))}
            </CommandGroup>
          )}
          
          {filteredItems.length > 0 && (
            <>
              {['page', 'homeowner', 'lead', 'invoice', 'document'].map(type => {
                const items = filteredItems.filter(item => item.type === type);
                if (items.length === 0) return null;
                
                return (
                  <React.Fragment key={type}>
                    <CommandGroup heading={type.charAt(0).toUpperCase() + type.slice(1) + 's'}>
                      {items.map((item) => (
                        <CommandItem
                          key={item.id}
                          onSelect={() => handleSelect(item)}
                          className="flex items-center justify-between py-3"
                        >
                          <div className="flex items-center gap-3">
                            {item.icon}
                            <div>
                              <div className="font-medium">{item.title}</div>
                              {item.subtitle && (
                                <div className="text-sm text-muted-foreground">{item.subtitle}</div>
                              )}
                            </div>
                          </div>
                          <Badge variant="secondary" className={`text-xs ${getTypeColor(item.type)}`}>
                            {item.type}
                          </Badge>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                    <CommandSeparator />
                  </React.Fragment>
                );
              })}
            </>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
};

export default GlobalSearch;
