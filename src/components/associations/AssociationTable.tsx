
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { PencilLine, Trash2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import TooltipButton from '@/components/ui/tooltip-button';
import { Association } from '@/types/association-types';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import AssociationEditDialog from './AssociationEditDialog';
import { LoadingState } from '@/components/ui/loading-state';
import ColumnSelector from '@/components/table/ColumnSelector';
import { useUserColumns } from '@/hooks/useUserColumns';

export const associationTableColumns = [
  { id: 'name', label: 'Association Name' },
  { id: 'property_type', label: 'Type' },
  { id: 'location', label: 'Location' },
  { id: 'contact_email', label: 'Contact' },
  { id: 'status', label: 'Status' },
  { id: 'total_units', label: 'Units' },
  { id: 'phone', label: 'Phone' },
  { id: 'created_at', label: 'Created' },
  { id: 'founded_date', label: 'Founded' },
  { id: 'insurance_expiration', label: 'Insurance Exp.' },
  { id: 'fire_inspection_due', label: 'Fire Insp. Due' },
  { id: 'actions', label: 'Actions' }
];

const defaultColumns = ['name', 'property_type', 'location', 'contact_email', 'status', 'actions'];

interface AssociationTableProps {
  associations: Association[];
  isLoading: boolean;
  onEdit?: (id: string, data: Partial<Association>) => void;
  onDelete?: (id: string) => void;
  onToggleSelect?: (association: Association) => void;
  selectedAssociations?: Association[];
  onViewProfile?: (id: string) => void;
}

const AssociationTable: React.FC<AssociationTableProps> = ({ 
  associations, 
  isLoading, 
  onEdit,
  onDelete,
  onToggleSelect,
  selectedAssociations = [],
  onViewProfile
}) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedAssociation, setSelectedAssociation] = useState<Association | null>(null);
  
  const { 
    visibleColumnIds, 
    updateVisibleColumns, 
    reorderColumns, 
    resetToDefaults,
    loading: columnsLoading 
  } = useUserColumns(
    associationTableColumns, 
    'associations-table'
  );

  const handleEditClick = (association: Association) => {
    setSelectedAssociation(association);
    setEditDialogOpen(true);
  };

  const handleDeleteClick = (association: Association) => {
    setSelectedAssociation(association);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedAssociation && onDelete) {
      onDelete(selectedAssociation.id);
    }
    setDeleteDialogOpen(false);
  };

  const handleSaveEdit = (data: Partial<Association>) => {
    if (selectedAssociation && onEdit) {
      onEdit(selectedAssociation.id, data);
    }
    setEditDialogOpen(false);
  };

  const isSelected = (association: Association) => {
    return selectedAssociations.some(a => a.id === association.id);
  };

  // Format date for display
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  if (isLoading || columnsLoading) {
    return <LoadingState variant="skeleton" count={3} />;
  }
  
  return (
    <>
      <div className="flex justify-end mb-4">
        <ColumnSelector
          columns={associationTableColumns}
          selectedColumns={visibleColumnIds}
          onChange={updateVisibleColumns}
          onReorder={reorderColumns}
          resetToDefaults={resetToDefaults}
          className="mb-2"
        />
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {onToggleSelect && visibleColumnIds.some(col => col === 'select') && (
                <TableHead className="w-[50px]">
                  <span className="sr-only">Select</span>
                </TableHead>
              )}
              {visibleColumnIds.includes('name') && <TableHead>Association Name</TableHead>}
              {visibleColumnIds.includes('property_type') && <TableHead>Type</TableHead>}
              {visibleColumnIds.includes('location') && <TableHead>Location</TableHead>}
              {visibleColumnIds.includes('contact_email') && <TableHead>Contact</TableHead>}
              {visibleColumnIds.includes('total_units') && <TableHead>Units</TableHead>}
              {visibleColumnIds.includes('phone') && <TableHead>Phone</TableHead>}
              {visibleColumnIds.includes('created_at') && <TableHead>Created</TableHead>}
              {visibleColumnIds.includes('founded_date') && <TableHead>Founded</TableHead>}
              {visibleColumnIds.includes('insurance_expiration') && <TableHead>Insurance Exp.</TableHead>}
              {visibleColumnIds.includes('fire_inspection_due') && <TableHead>Fire Insp. Due</TableHead>}
              {visibleColumnIds.includes('status') && <TableHead>Status</TableHead>}
              {visibleColumnIds.includes('actions') && <TableHead className="w-[100px]">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {associations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={visibleColumnIds.length + (onToggleSelect ? 1 : 0)} className="text-center py-8 text-muted-foreground">
                  No associations found
                </TableCell>
              </TableRow>
            ) : (
              associations.map((association) => (
                <TableRow 
                  key={association.id}
                  className={isSelected(association) ? "bg-muted/50" : ""}
                >
                  {onToggleSelect && visibleColumnIds.includes('select') && (
                    <TableCell>
                      <Checkbox 
                        checked={isSelected(association)}
                        onCheckedChange={() => onToggleSelect(association)}
                        aria-label={`Select ${association.name}`}
                      />
                    </TableCell>
                  )}
                  {visibleColumnIds.includes('name') && (
                    <TableCell>
                      {onViewProfile ? (
                        <button 
                          onClick={() => onViewProfile(association.id)} 
                          className="font-medium hover:underline text-left"
                        >
                          {association.name}
                        </button>
                      ) : (
                        <Link to={`/system/associations/${association.id}`} className="font-medium hover:underline">
                          {association.name}
                        </Link>
                      )}
                    </TableCell>
                  )}
                  {visibleColumnIds.includes('property_type') && (
                    <TableCell>{association.property_type || 'HOA'}</TableCell>
                  )}
                  {visibleColumnIds.includes('location') && (
                    <TableCell>
                      {association.city && association.state 
                        ? `${association.city}, ${association.state}`
                        : association.address || 'No location data'}
                    </TableCell>
                  )}
                  {visibleColumnIds.includes('contact_email') && (
                    <TableCell>{association.contact_email || 'No contact info'}</TableCell>
                  )}
                  {visibleColumnIds.includes('total_units') && (
                    <TableCell>{association.total_units || 'N/A'}</TableCell>
                  )}
                  {visibleColumnIds.includes('phone') && (
                    <TableCell>{association.phone || 'N/A'}</TableCell>
                  )}
                  {visibleColumnIds.includes('created_at') && (
                    <TableCell>{formatDate(association.created_at)}</TableCell>
                  )}
                  {visibleColumnIds.includes('founded_date') && (
                    <TableCell>{association.founded_date || 'N/A'}</TableCell>
                  )}
                  {visibleColumnIds.includes('insurance_expiration') && (
                    <TableCell>{association.insurance_expiration || 'N/A'}</TableCell>
                  )}
                  {visibleColumnIds.includes('fire_inspection_due') && (
                    <TableCell>{association.fire_inspection_due || 'N/A'}</TableCell>
                  )}
                  {visibleColumnIds.includes('status') && (
                    <TableCell>
                      {!association.is_archived ? (
                        <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50">Active</Badge>
                      ) : (
                        <Badge variant="outline" className="bg-gray-50 text-gray-700 hover:bg-gray-50">Inactive</Badge>
                      )}
                    </TableCell>
                  )}
                  {visibleColumnIds.includes('actions') && (
                    <TableCell>
                      <div className="flex gap-2">
                        <TooltipButton
                          size="icon"
                          variant="ghost"
                          tooltip="Edit Association"
                          onClick={() => handleEditClick(association)}
                        >
                          <PencilLine className="h-4 w-4" />
                        </TooltipButton>
                        <TooltipButton
                          size="icon"
                          variant="ghost"
                          tooltip="Delete Association"
                          onClick={() => handleDeleteClick(association)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </TooltipButton>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the association "{selectedAssociation?.name}". 
              This action cannot be undone and may affect properties, residents, and data associated with this community.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Association Dialog */}
      {selectedAssociation && (
        <AssociationEditDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          association={selectedAssociation}
          onSave={handleSaveEdit}
        />
      )}
    </>
  );
};

export default AssociationTable;
