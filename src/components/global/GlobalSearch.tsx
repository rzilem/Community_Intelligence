import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandGroup,
  CommandItem,
  CommandEmpty,
  CommandSeparator,
} from '@/components/ui/command';
import { quickActionItems } from '@/data/quickActionItems';
import { mockResidents } from '@/pages/residents/resident-data';
import { mockProperties } from '@/components/properties/PropertyData';
import { mockVendors } from '@/data/vendors-data';

interface SearchItem {
  id: string;
  label: string;
  type: 'page' | 'resident' | 'property' | 'vendor';
  path?: string;
}

const highlightText = (text: string, query: string) => {
  if (!query) return text;
  const regex = new RegExp(`(${query})`, 'ig');
  const parts = text.split(regex);
  return (
    <>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <mark key={i} className="bg-yellow-200 dark:bg-yellow-800 px-1 rounded">
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
};

const GlobalSearch: React.FC = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [debounced, setDebounced] = useState('');

  // Debounce search input
  useEffect(() => {
    const t = setTimeout(() => setDebounced(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  // Keyboard shortcut Ctrl/Cmd + K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const items = useMemo<SearchItem[]>(() => {
    const pages: SearchItem[] = quickActionItems.map((item) => ({
      id: item.path,
      label: item.title,
      type: 'page',
      path: item.path,
    }));

    const residents: SearchItem[] = mockResidents.map((r) => ({
      id: r.id,
      label: r.name,
      type: 'resident',
      path: `/residents/${r.id}`,
    }));

    const properties: SearchItem[] = mockProperties.map((p) => ({
      id: p.id,
      label: p.address,
      type: 'property',
      path: `/properties/${p.id}`,
    }));

    const vendors: SearchItem[] = mockVendors.map((v) => ({
      id: v.id,
      label: v.name,
      type: 'vendor',
      path: `/operations/vendors/${v.id}`,
    }));

    return [...pages, ...residents, ...properties, ...vendors];
  }, []);

  const results = useMemo(() => {
    if (!debounced) return items;
    const q = debounced.toLowerCase();
    return items.filter(
      (item) => item.label.toLowerCase().includes(q) || item.id.toLowerCase().includes(q)
    );
  }, [debounced, items]);

  const handleSelect = (item: SearchItem) => {
    if (item.path) {
      navigate(item.path);
      setOpen(false);
    }
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen} aria-label="Global search">
      <CommandInput
        placeholder="Search..."
        value={search}
        onValueChange={setSearch}
      />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Pages">
          {results
            .filter((i) => i.type === 'page')
            .map((item) => (
              <CommandItem key={item.id} onSelect={() => handleSelect(item)}>
                {highlightText(item.label, debounced)}
              </CommandItem>
            ))}
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Residents">
          {results
            .filter((i) => i.type === 'resident')
            .map((item) => (
              <CommandItem key={item.id} onSelect={() => handleSelect(item)}>
                {highlightText(item.label, debounced)}
              </CommandItem>
            ))}
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Properties">
          {results
            .filter((i) => i.type === 'property')
            .map((item) => (
              <CommandItem key={item.id} onSelect={() => handleSelect(item)}>
                {highlightText(item.label, debounced)}
              </CommandItem>
            ))}
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Vendors">
          {results
            .filter((i) => i.type === 'vendor')
            .map((item) => (
              <CommandItem key={item.id} onSelect={() => handleSelect(item)}>
                {highlightText(item.label, debounced)}
              </CommandItem>
            ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
};

export default GlobalSearch;
