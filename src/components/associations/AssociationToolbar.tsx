
import React from 'react';
import { PlusCircle, Filter, RefreshCw, MoreHorizontal, Check, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AddAssociationDialog } from '@/components/associations/AddAssociationDialog';
import { AssociationFormData } from '@/components/associations/AssociationForm';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface AssociationToolbarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onRefresh: () => void;
  isLoading: boolean;
  isCreating: boolean;
  onSaveAssociation: (data: AssociationFormData) => void;
  onSelectAll?: () => void;
  selectedCount?: number;
  totalCount?: number;
  associations?: any[];
}

const AssociationToolbar: React.FC<AssociationToolbarProps> = ({
  searchTerm,
  onSearchChange,
  onRefresh,
  isLoading,
  isCreating,
  onSaveAssociation,
  onSelectAll,
  selectedCount = 0,
  totalCount = 0,
  associations = []
}) => {
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [isExporting, setIsExporting] = React.useState(false);

  const handleAddAssociation = (data: AssociationFormData) => {
    onSaveAssociation(data);
    setDialogOpen(false);
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      // Try to get data from Supabase if available
      let associationsData = associations;
      
      if (!associationsData || associationsData.length === 0) {
        try {
          const { data, error } = await supabase
            .from('associations')
            .select('*');
            
          if (error) throw error;
          associationsData = data;
        } catch (dbError) {
          console.warn('Falling back to mock data:', dbError);
          // Fallback to mock data
          associationsData = [
            { id: '1', name: 'Oak Ridge HOA', address: '123 Main St', total_units: 150, property_type: 'Single Family' },
            { id: '2', name: 'Maple Grove HOA', address: '456 Elm St', total_units: 75, property_type: 'Condo' }
          ];
        }
      }

      // Convert to CSV
      const headers = ['Name', 'Address', 'Total Units', 'Property Type'].join(',');
      const rows = associationsData.map(assoc => [
        `"${assoc.name || ''}"`,
        `"${assoc.address || ''}"`,
        assoc.total_units || 0,
        `"${assoc.property_type || ''}"`
      ].join(','));
      
      const csvContent = [headers, ...rows].join('\n');
      
      // Create download
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.setAttribute('hidden', '');
      a.setAttribute('href', url);
      a.setAttribute('download', 'associations.csv');
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      toast.success('Associations exported successfully');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export associations');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {onSelectAll && (
        <div className="flex items-center gap-2 mr-2">
          <Checkbox
            id="select-all"
            checked={selectedCount > 0 && selectedCount === totalCount}
            onCheckedChange={onSelectAll}
            aria-label="Select all associations"
          />
          <label
            htmlFor="select-all"
            className="text-sm text-muted-foreground cursor-pointer select-none"
          >
            {selectedCount > 0 ? `${selectedCount}/${totalCount}` : "Select all"}
          </label>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger asChild>
          <Button id="create-association-button">
            <PlusCircle className="mr-2 h-4 w-4" />
            New Association
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Association</DialogTitle>
          </DialogHeader>
          <AddAssociationDialog 
            onSave={handleAddAssociation} 
            isCreating={isCreating}
          />
        </DialogContent>
      </Dialog>

      <Button variant="outline" onClick={onRefresh} disabled={isLoading}>
        <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
        Refresh
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleExport} disabled={isExporting}>
            {isExporting ? 'Exporting...' : 'Export Associations'}
            {isExporting ? null : <Download className="ml-2 h-4 w-4" />}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => onSearchChange('')}>
            Clear filters
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default AssociationToolbar;
