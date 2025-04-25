import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface ResidentTableProps {
  residents: any[];
}

const ResidentTable: React.FC<ResidentTableProps> = ({ residents }) => {
  const navigate = useNavigate();
  
  if (residents.length === 0) {
    return (
      <div className="text-center p-4 border rounded-md">
        <p className="text-muted-foreground">No owners found matching your criteria.</p>
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
            <TableHead>Association</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Type</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {residents.map((resident) => (
            <TableRow key={resident.id}>
              <TableCell className="font-medium">{resident.name}</TableCell>
              <TableCell>{resident.email}</TableCell>
              <TableCell>{resident.propertyAddress}</TableCell>
              <TableCell>{resident.association}</TableCell>
              <TableCell>
                <Badge 
                  variant={resident.status === 'active' ? 'default' : 'outline'}
                  className={resident.status === 'inactive' ? 'bg-gray-100 text-gray-800' : ''}
                >
                  {resident.status.charAt(0).toUpperCase() + resident.status.slice(1)}
                </Badge>
              </TableCell>
              <TableCell>
                {resident.type === 'owner' ? 'Owner' : 
                 resident.type === 'tenant' ? 'Tenant' : 
                 resident.type === 'family' ? 'Family Member' : 'Other'}
              </TableCell>
              <TableCell className="text-right">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigate(`/residents/${resident.id}`)}
                >
                  View
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ResidentTable;
