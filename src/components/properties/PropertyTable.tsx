import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PropertyUI } from '@/types/property-types';
import { Badge } from '@/components/ui/badge';
import TooltipButton from '@/components/ui/tooltip-button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface PropertyTableProps {
  properties: PropertyUI[];
}

const getStatusBadge = (status: PropertyUI['status']) => {
  switch (status) {
    case 'occupied':
      return <Badge className="bg-green-500">Occupied</Badge>;
    case 'vacant':
      return <Badge variant="outline" className="border-blue-500 text-blue-500">Vacant</Badge>;
    case 'pending':
      return <Badge variant="secondary">Pending</Badge>;
    case 'delinquent':
      return <Badge variant="destructive">Delinquent</Badge>;
    default:
      return <Badge variant="outline">Unknown</Badge>;
  }
};

export const PropertyTable: React.FC<PropertyTableProps> = ({ properties }) => {
  const navigate = useNavigate();
  
  const navigateToAssociation = (associationId: string) => {
    navigate(`/system/associations/${associationId}`);
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Address</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Size</TableHead>
            <TableHead>Association</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Owner</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {properties.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="py-6 text-center text-muted-foreground">
                No properties found matching your search.
              </TableCell>
            </TableRow>
          ) : (
            properties.map(property => (
              <TableRow key={property.id} className="hover:bg-muted/20">
                <TableCell className="font-medium">{property.id}</TableCell>
                <TableCell>{property.address}</TableCell>
                <TableCell className="capitalize">{property.type.replace('-', ' ')}</TableCell>
                <TableCell>{property.sqFt} sq.ft.</TableCell>
                <TableCell>
                  <button 
                    onClick={() => navigateToAssociation(property.associationId)}
                    className="text-blue-600 hover:underline font-medium"
                  >
                    {property.association}
                  </button>
                </TableCell>
                <TableCell>{getStatusBadge(property.status)}</TableCell>
                <TableCell>{property.ownerName || 'Not Assigned'}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <TooltipButton size="sm" variant="ghost" tooltip="View property details">
                      View
                    </TooltipButton>
                    <TooltipButton size="sm" variant="outline" tooltip="Edit property information">
                      Edit
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

export default PropertyTable;
