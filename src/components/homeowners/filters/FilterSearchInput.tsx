
import React from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface FilterSearchInputProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

const FilterSearchInput: React.FC<FilterSearchInputProps> = ({
  searchTerm,
  setSearchTerm
}) => {
  return (
    <div className="relative flex-grow">
      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
      <Input 
        placeholder="Search requests..." 
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="pl-10"
      />
    </div>
  );
};

export default FilterSearchInput;
