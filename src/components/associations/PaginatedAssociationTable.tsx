
import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import ApiError from "@/components/ui/api-error";
import { Association } from '@/types/association-types';
import { usePaginatedData } from "@/hooks/usePaginatedData";

interface PaginatedAssociationTableProps {
  associationStatus?: 'active' | 'inactive' | 'all';
  onEdit?: (id: string, data: Partial<Association>) => void;
  onDelete?: (id: string) => void;
  onToggleSelect?: (association: Association) => void;
  selectedAssociations?: Association[];
}

const PaginatedAssociationTable: React.FC<PaginatedAssociationTableProps> = ({
  associationStatus = 'all',
  onEdit,
  onDelete,
  onToggleSelect,
  selectedAssociations = []
}) => {
  // Create filters based on status
  const filters: Record<string, any> = {};
  if (associationStatus !== 'all') {
    filters.is_archived = associationStatus === 'inactive';
  }

  const {
    data: associations,
    loading,
    error,
    page,
    pageCount,
    nextPage,
    prevPage,
    refresh
  } = usePaginatedData<Association>(
    'associations',
    { limit: 5 },
    filters,
    { column: 'name', ascending: true }
  );

  const isSelected = (id: string) => selectedAssociations.some(a => a.id === id);

  if (loading) {
    return (
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (error) {
    return <ApiError error={error} onRetry={refresh} title="Failed to load associations" />;
  }

  if (!associations.length) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No associations found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            {onToggleSelect && <TableHead className="w-[40px]"></TableHead>}
            <TableHead>Name</TableHead>
            <TableHead className="hidden md:table-cell">City</TableHead>
            <TableHead className="hidden md:table-cell">State</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {associations.map((association) => (
            <TableRow key={association.id} className={isSelected(association.id) ? "bg-primary/5" : ""}>
              {onToggleSelect && (
                <TableCell>
                  <input
                    type="checkbox"
                    checked={isSelected(association.id)}
                    onChange={() => onToggleSelect(association)}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                </TableCell>
              )}
              <TableCell className="font-medium">{association.name}</TableCell>
              <TableCell className="hidden md:table-cell">{association.city || "-"}</TableCell>
              <TableCell className="hidden md:table-cell">{association.state || "-"}</TableCell>
              <TableCell>
                <Badge
                  variant={association.is_archived ? "outline" : "default"}
                  className={association.is_archived ? "bg-gray-100 text-gray-800" : "bg-green-100 text-green-800"}
                >
                  {association.is_archived ? "Inactive" : "Active"}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  {onEdit && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(association.id, association)}
                      title="Edit association"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  )}
                  {onDelete && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(association.id)}
                      title="Delete association"
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Page {page} of {pageCount || 1}
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={prevPage}
            disabled={page === 1}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={nextPage}
            disabled={page >= pageCount}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PaginatedAssociationTable;
