
import React from 'react';
import { Link } from 'react-router-dom';
import { PencilLine, Trash2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import TooltipButton from '@/components/ui/tooltip-button';
import { Association } from '@/types/association-types';

interface AssociationTableProps {
  associations: Association[];
  isLoading: boolean;
}

const AssociationTable: React.FC<AssociationTableProps> = ({ associations, isLoading }) => {
  if (isLoading) {
    return (
      <div className="rounded-md border p-8">
        <div className="text-center text-muted-foreground">Loading associations...</div>
      </div>
    );
  }
  
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
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
              <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                No associations found
              </TableCell>
            </TableRow>
          ) : (
            associations.map((association) => (
              <TableRow key={association.id}>
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
                    >
                      <PencilLine className="h-4 w-4" />
                    </TooltipButton>
                    <TooltipButton
                      size="icon"
                      variant="ghost"
                      tooltip="Delete Association"
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
  );
};

export default AssociationTable;
