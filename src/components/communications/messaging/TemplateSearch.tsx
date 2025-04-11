
import React from 'react';
import { Search, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface TemplateSearchProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
}

const TemplateSearch: React.FC<TemplateSearchProps> = ({
  searchValue,
  onSearchChange
}) => {
  return (
    <div className="flex gap-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search templates"
          className="pl-9 w-[250px]"
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      <Button className="gap-2">
        <Plus className="h-4 w-4" />
        New Template
      </Button>
    </div>
  );
};

export default TemplateSearch;
