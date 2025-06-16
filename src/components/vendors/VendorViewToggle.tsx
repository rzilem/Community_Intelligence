
import React from 'react';
import { Button } from '@/components/ui/button';
import { Grid3X3, List } from 'lucide-react';

interface VendorViewToggleProps {
  view: 'table' | 'cards';
  onViewChange: (view: 'table' | 'cards') => void;
}

const VendorViewToggle: React.FC<VendorViewToggleProps> = ({ view, onViewChange }) => {
  return (
    <div className="flex items-center bg-gray-100 rounded-lg p-1">
      <Button
        variant={view === 'table' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onViewChange('table')}
        className="flex items-center gap-2"
      >
        <List size={16} />
        <span className="hidden sm:inline">Table</span>
      </Button>
      <Button
        variant={view === 'cards' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onViewChange('cards')}
        className="flex items-center gap-2"
      >
        <Grid3X3 size={16} />
        <span className="hidden sm:inline">Cards</span>
      </Button>
    </div>
  );
};

export default VendorViewToggle;
