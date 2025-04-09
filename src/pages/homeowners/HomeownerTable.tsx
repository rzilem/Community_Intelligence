
import React from 'react';
import { Homeowner } from './homeowner-types';
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

interface HomeownerTableProps {
  homeowners: Homeowner[];
  selectedColumns: string[];
}

const HomeownerTable: React.FC<HomeownerTableProps> = ({ homeowners, selectedColumns }) => {
  const navigate = useNavigate();
  
  // Function to handle row click
  const handleHomeownerClick = (id: string) => {
    navigate(`/homeowners/${id}`);
  };

  if (homeowners.length === 0) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {selectedColumns.includes('name') && <TableHead>Name</TableHead>}
              {selectedColumns.includes('unit') && <TableHead>Unit</TableHead>}
              {selectedColumns.includes('property') && <TableHead>Property</TableHead>}
              {selectedColumns.includes('email') && <TableHead>Email</TableHead>}
              {selectedColumns.includes('status') && <TableHead>Status</TableHead>}
              {selectedColumns.includes('moveInDate') && <TableHead>Move-In Date</TableHead>}
              {selectedColumns.includes('moveOutDate') && <TableHead>Move-Out Date</TableHead>}
              {selectedColumns.includes('propertyAddress') && <TableHead>Property Address</TableHead>}
              {selectedColumns.includes('balance') && <TableHead>Balance</TableHead>}
              {selectedColumns.includes('lastPayment') && <TableHead>Last Payment</TableHead>}
              {selectedColumns.includes('aclStartDate') && <TableHead>ACL Start Date</TableHead>}
              {selectedColumns.includes('actions') && <TableHead className="text-right">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell colSpan={selectedColumns.length} className="text-center h-24 text-muted-foreground">
                No homeowners found matching your search.
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
            {selectedColumns.includes('name') && <TableHead>Name</TableHead>}
            {selectedColumns.includes('unit') && <TableHead>Unit</TableHead>}
            {selectedColumns.includes('property') && <TableHead>Property</TableHead>}
            {selectedColumns.includes('email') && <TableHead>Email</TableHead>}
            {selectedColumns.includes('status') && <TableHead>Status</TableHead>}
            {selectedColumns.includes('moveInDate') && <TableHead>Move-In Date</TableHead>}
            {selectedColumns.includes('moveOutDate') && <TableHead>Move-Out Date</TableHead>}
            {selectedColumns.includes('propertyAddress') && <TableHead>Property Address</TableHead>}
            {selectedColumns.includes('balance') && <TableHead>Balance</TableHead>}
            {selectedColumns.includes('lastPayment') && <TableHead>Last Payment</TableHead>}
            {selectedColumns.includes('aclStartDate') && <TableHead>ACL Start Date</TableHead>}
            {selectedColumns.includes('actions') && <TableHead className="text-right">Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {homeowners.map(homeowner => (
            <TableRow 
              key={homeowner.id} 
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => handleHomeownerClick(homeowner.id)}
            >
              {selectedColumns.includes('name') && (
                <TableCell className="font-medium">{homeowner.name}</TableCell>
              )}
              {selectedColumns.includes('unit') && (
                <TableCell>{homeowner.unit}</TableCell>
              )}
              {selectedColumns.includes('property') && (
                <TableCell>{homeowner.property}</TableCell>
              )}
              {selectedColumns.includes('email') && (
                <TableCell>{homeowner.email}</TableCell>
              )}
              {selectedColumns.includes('status') && (
                <TableCell>
                  <Badge 
                    variant={homeowner.status === 'Active' ? 'default' : 'outline'} 
                    className={homeowner.status === 'Inactive' ? 'bg-gray-100 text-gray-800' : ''}
                  >
                    {homeowner.status}
                  </Badge>
                </TableCell>
              )}
              {selectedColumns.includes('moveInDate') && (
                <TableCell>{formatDate(homeowner.moveInDate)}</TableCell>
              )}
              {selectedColumns.includes('moveOutDate') && (
                <TableCell>{homeowner.moveOutDate ? formatDate(homeowner.moveOutDate) : '-'}</TableCell>
              )}
              {selectedColumns.includes('propertyAddress') && (
                <TableCell>{homeowner.propertyAddress}</TableCell>
              )}
              {selectedColumns.includes('balance') && (
                <TableCell className={homeowner.balance > 0 ? 'text-red-600 font-medium' : ''}>
                  ${homeowner.balance.toFixed(2)}
                </TableCell>
              )}
              {selectedColumns.includes('lastPayment') && (
                <TableCell>{homeowner.lastPayment ? formatDate(homeowner.lastPayment) : '-'}</TableCell>
              )}
              {selectedColumns.includes('aclStartDate') && (
                <TableCell>{homeowner.aclStartDate ? formatDate(homeowner.aclStartDate) : '-'}</TableCell>
              )}
              {selectedColumns.includes('actions') && (
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-1" onClick={(e) => e.stopPropagation()}>
                    <TooltipButton
                      size="sm"
                      variant="ghost"
                      tooltip="View details"
                      onClick={() => navigate(`/homeowners/${homeowner.id}`)}
                    >
                      View
                    </TooltipButton>
                    <TooltipButton
                      size="sm"
                      variant="ghost"
                      tooltip="Edit homeowner"
                    >
                      Edit
                    </TooltipButton>
                  </div>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default HomeownerTable;
