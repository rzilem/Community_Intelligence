
import React from 'react';
import { Homeowner } from './homeowner-types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import TooltipButton from '@/components/ui/tooltip-button';
import { useNavigate } from 'react-router-dom';
import { getStatusBadge } from './homeowner-utils';
import { formatCurrency, formatDate, formatPaymentInfo } from './homeowner-utils';

interface HomeownerTableProps {
  homeowners: Homeowner[];
  selectedColumns: string[];
}

const HomeownerTable: React.FC<HomeownerTableProps> = ({ homeowners, selectedColumns }) => {
  const navigate = useNavigate();

  const handleViewHomeowner = (id: string) => {
    navigate(`/homeowners/${id}`);
  };

  const getColumnValue = (homeowner: Homeowner, column: string) => {
    switch (column) {
      case 'name':
        return (
          <div 
            className="flex items-center cursor-pointer hover:text-primary"
            onClick={() => handleViewHomeowner(homeowner.id)}
          >
            <Avatar className="h-6 w-6 mr-2">
              <AvatarImage src={homeowner.avatarUrl} />
              <AvatarFallback>
                {homeowner.name.split(' ').map(part => part[0]).join('').toUpperCase()}
              </AvatarFallback>
            </Avatar>
            {homeowner.name}
          </div>
        );
      case 'unit':
        return homeowner.unitNumber || '-';
      case 'property':
        return homeowner.association || '-';
      case 'email':
        return homeowner.email || '-';
      case 'status':
        return getStatusBadge(homeowner.status);
      case 'moveInDate':
        return formatDate(homeowner.moveInDate);
      case 'moveOutDate':
        return homeowner.moveOutDate ? formatDate(homeowner.moveOutDate) : '-';
      case 'propertyAddress':
        return homeowner.propertyAddress || '-';
      case 'balance':
        return formatCurrency(homeowner.balance);
      case 'lastPayment':
        return formatPaymentInfo(homeowner.lastPayment?.amount, homeowner.lastPayment?.date);
      case 'aclStartDate':
        return homeowner.aclStartDate ? formatDate(homeowner.aclStartDate) : '-';
      case 'actions':
        return (
          <div className="flex justify-end gap-2">
            <TooltipButton 
              size="sm" 
              variant="ghost" 
              tooltip="View homeowner details"
              onClick={() => handleViewHomeowner(homeowner.id)}
            >
              View
            </TooltipButton>
            <TooltipButton size="sm" variant="outline" tooltip="Edit homeowner information">
              Edit
            </TooltipButton>
          </div>
        );
      default:
        return '-';
    }
  };

  const getColumnLabel = (column: string) => {
    switch (column) {
      case 'name': return 'Name';
      case 'unit': return 'Unit';
      case 'property': return 'Property';
      case 'email': return 'Email';
      case 'status': return 'Status';
      case 'moveInDate': return 'Move-In Date';
      case 'moveOutDate': return 'Move-Out Date';
      case 'propertyAddress': return 'Property Address';
      case 'balance': return 'Balance';
      case 'lastPayment': return 'Last Payment';
      case 'aclStartDate': return 'ACL Start Date';
      case 'actions': return 'Actions';
      default: return column;
    }
  };

  if (homeowners.length === 0) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {selectedColumns.map(column => (
                <TableHead key={column}>{getColumnLabel(column)}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell colSpan={selectedColumns.length} className="py-6 text-center text-muted-foreground">
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
            {selectedColumns.map(column => (
              <TableHead key={column}>{getColumnLabel(column)}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {homeowners.map(homeowner => (
            <TableRow key={homeowner.id} className="hover:bg-muted/20">
              {selectedColumns.map(column => (
                <TableCell key={`${homeowner.id}-${column}`}>
                  {getColumnValue(homeowner, column)}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default HomeownerTable;
