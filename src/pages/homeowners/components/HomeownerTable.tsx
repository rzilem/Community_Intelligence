
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Edit } from 'lucide-react';

interface HomeownerTableProps {
  homeowners: any[];
  loading: boolean;
  visibleColumns: string[];
  onToggleColumn: (columnId: string) => void;
  onResetColumns: () => void;
}

const HomeownerTable: React.FC<HomeownerTableProps> = ({
  homeowners,
  loading,
  visibleColumns,
  onToggleColumn,
  onResetColumns
}) => {
  if (loading) {
    return <div className="text-center py-8">Loading homeowners...</div>;
  }

  if (homeowners.length === 0) {
    return <div className="text-center py-8">No homeowners found.</div>;
  }

  const getStatusBadge = (status: string) => {
    const variants: { [key: string]: 'default' | 'secondary' | 'destructive' | 'outline' } = {
      'active': 'default',
      'inactive': 'secondary',
      'pending-approval': 'outline'
    };
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>;
  };

  return (
    <div className="overflow-x-auto border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            {visibleColumns.includes('name') && <TableHead>Name</TableHead>}
            {visibleColumns.includes('email') && <TableHead>Email</TableHead>}
            {visibleColumns.includes('property') && <TableHead>Property</TableHead>}
            {visibleColumns.includes('status') && <TableHead>Status</TableHead>}
            {visibleColumns.includes('association') && <TableHead>Association</TableHead>}
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {homeowners.map((homeowner) => (
            <TableRow key={homeowner.id}>
              {visibleColumns.includes('name') && (
                <TableCell className="font-medium">{homeowner.name}</TableCell>
              )}
              {visibleColumns.includes('email') && (
                <TableCell>{homeowner.email}</TableCell>
              )}
              {visibleColumns.includes('property') && (
                <TableCell>{homeowner.propertyAddress || homeowner.property}</TableCell>
              )}
              {visibleColumns.includes('status') && (
                <TableCell>{getStatusBadge(homeowner.status)}</TableCell>
              )}
              {visibleColumns.includes('association') && (
                <TableCell>{homeowner.associationName || homeowner.association}</TableCell>
              )}
              <TableCell>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default HomeownerTable;
