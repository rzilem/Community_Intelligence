
import React from 'react';
import { Resident } from './resident-types';
import { Badge } from '@/components/ui/badge';
import { Link, useNavigate } from 'react-router-dom';
import { formatDate } from '@/lib/date-utils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import TooltipButton from '@/components/ui/tooltip-button';

interface ResidentTableProps {
  residents: Resident[];
}

const ResidentTable: React.FC<ResidentTableProps> = ({ residents }) => {
  const navigate = useNavigate();
  
  // Function to handle row click
  const handleResidentClick = (id: string) => {
    navigate(`/residents/${id}`);
  };

  if (residents.length === 0) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Property</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Move-In Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell colSpan={7} className="text-center h-24 text-muted-foreground">
                No residents found matching your search.
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Property</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Move-In Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {residents.map(resident => (
            <TableRow 
              key={resident.id} 
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => handleResidentClick(resident.id)}
            >
              <TableCell className="font-medium">{resident.name}</TableCell>
              <TableCell>{resident.email}</TableCell>
              <TableCell>{resident.propertyAddress}</TableCell>
              <TableCell>{resident.type}</TableCell>
              <TableCell>{formatDate(resident.moveInDate)}</TableCell>
              <TableCell>
                <Badge 
                  variant={resident.status === 'active' ? 'default' : 'outline'} 
                  className={resident.status === 'inactive' ? 'bg-gray-100 text-gray-800' : ''}
                >
                  {resident.status.charAt(0).toUpperCase() + resident.status.slice(1)}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end space-x-1" onClick={(e) => e.stopPropagation()}>
                  <TooltipButton
                    size="sm"
                    variant="ghost"
                    tooltip="View details"
                    onClick={() => navigate(`/residents/${resident.id}`)}
                  >
                    View
                  </TooltipButton>
                  <TooltipButton
                    size="sm"
                    variant="ghost"
                    tooltip="Edit resident"
                  >
                    Edit
                  </TooltipButton>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ResidentTable;
