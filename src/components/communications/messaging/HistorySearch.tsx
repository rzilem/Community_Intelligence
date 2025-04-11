
import React from 'react';
import { Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface HistorySearchProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
}

const HistorySearch: React.FC<HistorySearchProps> = ({
  searchValue,
  onSearchChange
}) => {
  return (
    <div className="flex gap-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search messages"
          className="pl-9 w-[250px]"
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      <Button variant="outline" className="gap-2">
        <Filter className="h-4 w-4" />
        Filters
      </Button>
    </div>
  );
};

export default HistorySearch;
