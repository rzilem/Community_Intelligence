
import React from "react";
import { Association } from "@/types/association-types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2 } from "lucide-react";

interface AssociationTableWithPaginationProps {
  associations: Association[];
  currentPage: number;
  pageSize: number;
  totalPages: number;
  onEdit: (id: string, data: Partial<Association>) => void;
  onDelete: (id: string) => void;
  setCurrentPage: (page: number) => void;
  isLoading: boolean;
}

const AssociationTableWithPagination: React.FC<AssociationTableWithPaginationProps> = ({
  associations,
  currentPage,
  pageSize,
  totalPages,
  onEdit,
  onDelete,
  setCurrentPage,
  isLoading,
}) => {
  return (
    <div>
      <div className="overflow-x-auto rounded-md border">
        <table className="min-w-full divide-y divide-muted">
          <thead>
            <tr className="bg-muted/40">
              <th className="px-4 py-2 text-left font-semibold text-sm">Name</th>
              <th className="px-4 py-2 text-left font-semibold text-sm hidden md:table-cell">City</th>
              <th className="px-4 py-2 text-left font-semibold text-sm hidden md:table-cell">State</th>
              <th className="px-4 py-2 text-left font-semibold text-sm">Status</th>
              <th className="px-4 py-2 text-right font-semibold text-sm">Actions</th>
            </tr>
          </thead>
          <tbody>
            {!isLoading && associations.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center py-8 text-muted-foreground">
                  No associations found.
                </td>
              </tr>
            )}
            {isLoading && (
              <tr>
                <td colSpan={5} className="text-center py-8 text-muted-foreground">
                  Loading...
                </td>
              </tr>
            )}
            {!isLoading &&
              associations.map((association) => (
                <tr key={association.id} className="border-b hover:bg-muted/20">
                  <td className="px-4 py-2 font-medium">{association.name}</td>
                  <td className="px-4 py-2 hidden md:table-cell">{association.city || "-"}</td>
                  <td className="px-4 py-2 hidden md:table-cell">{association.state || "-"}</td>
                  <td className="px-4 py-2">
                    <Badge
                      variant={association.is_archived ? "outline" : "default"}
                      className={
                        association.is_archived
                          ? "bg-gray-100 text-gray-800"
                          : "bg-green-100 text-green-800"
                      }
                    >
                      {association.is_archived ? "Inactive" : "Active"}
                    </Badge>
                  </td>
                  <td className="px-4 py-2 text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="mr-2"
                      onClick={() => onEdit(association.id, association)}
                      title="Edit association"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(association.id)}
                      title="Archive association"
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-center mt-4 gap-3">
        <div className="text-sm text-muted-foreground">
          Page {currentPage} of {totalPages}
        </div>
        <div className="flex gap-2 mt-2 sm:mt-0">
          <Button
            size="sm"
            variant="outline"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            Previous
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AssociationTableWithPagination;
