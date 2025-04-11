
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

interface AssociationTableProps {
  associations: Association[];
  isLoading: boolean;
  onEdit?: (id: string, data: Partial<Association>) => void;
  onDelete?: (id: string) => void;
  onToggleSelect?: (association: Association) => void;
  selectedAssociations?: Association[];
}

const AssociationTable: React.FC<AssociationTableProps> = ({ 
  associations, 
  isLoading, 
  onEdit,
  onDelete,
  onToggleSelect,
  selectedAssociations = []
}) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedAssociation, setSelectedAssociation] = useState<Association | null>(null);

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

  if (isLoading) {
    return <LoadingState variant="skeleton" count={3} />;
  }
  
  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {onToggleSelect && (
                <TableHead className="w-[50px]">
                  <span className="sr-only">Select</span>
                </TableHead>
              )}
              <TableHead>Association Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {associations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={onToggleSelect ? 7 : 6} className="text-center py-8 text-muted-foreground">
                  No associations found
                </TableCell>
              </TableRow>
            ) : (
              associations.map((association) => (
                <TableRow 
                  key={association.id}
                  className={isSelected(association) ? "bg-muted/50" : ""}
                >
                  {onToggleSelect && (
                    <TableCell>
                      <Checkbox 
                        checked={isSelected(association)}
                        onCheckedChange={() => onToggleSelect(association)}
                        aria-label={`Select ${association.name}`}
                      />
                    </TableCell>
                  )}
                  <TableCell>
                    <Link to={`/system/associations/${association.id}`} className="font-medium hover:underline">
                      {association.name}
                    </Link>
                  </TableCell>
                  <TableCell>{association.property_type || 'HOA'}</TableCell>
                  <TableCell>
                    {association.city && association.state 
                      ? `${association.city}, ${association.state}`
                      : association.address || 'No location data'}
                  </TableCell>
                  <TableCell>{association.contact_email || 'No contact info'}</TableCell>
                  <TableCell>
                    {!association.is_archived ? (
                      <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50">Active</Badge>
                    ) : (
                      <Badge variant="outline" className="bg-gray-50 text-gray-700 hover:bg-gray-50">Inactive</Badge>
                    )}
                  </TableCell>
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
