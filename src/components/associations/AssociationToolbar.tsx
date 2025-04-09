
import React from 'react';
import { Search, RefreshCw } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import AddAssociationDialog from './AddAssociationDialog';
import { AssociationFormData } from './AssociationForm';

interface AssociationToolbarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onRefresh: () => void;
  isLoading: boolean;
  isCreating: boolean;
  onSaveAssociation: (data: AssociationFormData) => void;
}

const AssociationToolbar: React.FC<AssociationToolbarProps> = ({
  searchTerm,
  onSearchChange,
  onRefresh,
  isLoading,
  isCreating,
  onSaveAssociation
}) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4 justify-between mb-6">
      <div className="relative flex-1">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search associations..."
          className="pl-8"
          value={searchTerm}
          onChange={e => onSearchChange(e.target.value)}
        />
      </div>
      <div className="flex gap-2">
        <Button 
          variant="outline" 
          onClick={onRefresh}
          disabled={isLoading}
          title="Refresh association list"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
        
        <AddAssociationDialog 
          isCreating={isCreating} 
          onSave={onSaveAssociation} 
        />
      </div>
    </div>
  );
};

export default AssociationToolbar;
