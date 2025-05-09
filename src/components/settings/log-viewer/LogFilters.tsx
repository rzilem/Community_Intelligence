
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';

interface LogFiltersProps {
  selectedFunction: string | undefined;
  setSelectedFunction: (value: string | undefined) => void;
  selectedLevel: string | undefined;
  setSelectedLevel: (value: string | undefined) => void;
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  functionNames: string[];
}

export const LogFilters: React.FC<LogFiltersProps> = ({
  selectedFunction,
  setSelectedFunction,
  selectedLevel,
  setSelectedLevel,
  searchQuery,
  setSearchQuery,
  functionNames
}) => {
  return (
    <div className="flex flex-col sm:flex-row gap-2">
      <div className="w-full sm:w-1/3">
        <Select 
          value={selectedFunction || ''} 
          onValueChange={(value) => setSelectedFunction(value || undefined)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select function" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Functions</SelectItem>
            {functionNames.map((name) => (
              <SelectItem key={name} value={name}>{name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="w-full sm:w-1/3">
        <Select 
          value={selectedLevel || ''} 
          onValueChange={(value) => setSelectedLevel(value || undefined)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select log level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Levels</SelectItem>
            <SelectItem value="info">Info</SelectItem>
            <SelectItem value="warn">Warning</SelectItem>
            <SelectItem value="error">Error</SelectItem>
            <SelectItem value="debug">Debug</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="w-full sm:w-1/3">
        <Input
          placeholder="Search logs..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
    </div>
  );
};
