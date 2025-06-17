
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Resident } from '@/types/resident-types';
import ResidentPagination from './ResidentPagination';

interface ResidentTableProps {
  loading: boolean;
  filteredResidents: (Resident & { 
    property?: { address: string; unit_number?: string };
    association?: { name: string };
    account_number?: string;
  })[];
  error: string | null;
  onRetry: () => void;
  currentPage: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

const ResidentTable: React.FC<ResidentTableProps> = ({
  loading,
  filteredResidents,
  error,
  onRetry,
  currentPage,
  pageSize,
  onPageChange,
  onPageSizeChange
}) => {
  // Calculate pagination
  const totalPages = Math.ceil(filteredResidents.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentPageData = filteredResidents.slice(startIndex, endIndex);

  const getTypeBadge = (type: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      'owner': 'default',
      'tenant': 'secondary',
      'family': 'outline',
      'other': 'outline'
    };
    return variants[type] || 'outline';
  };

  const extractStreetAddress = (fullAddress: string) => {
    if (!fullAddress) return '';
    
    // Remove city, state, zip from the end
    const addressParts = fullAddress.split(',');
    if (addressParts.length >= 2) {
      return addressParts[0].trim();
    }
    
    // Fallback: split by spaces and take first reasonable portion
    const words = fullAddress.split(' ');
    const cityStatePattern = /^[A-Z]{2}$/; // State abbreviation pattern
    const zipPattern = /^\d{5}(-\d{4})?$/; // ZIP code pattern
    
    let endIndex = words.length;
    for (let i = words.length - 1; i >= 0; i--) {
      if (cityStatePattern.test(words[i]) || zipPattern.test(words[i])) {
        endIndex = i;
      } else if (i < words.length - 2) {
        break;
      }
    }
    
    return words.slice(0, endIndex).join(' ');
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 flex flex-col items-center justify-center min-h-[400px]">
          <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
          <h3 className="text-lg font-medium">Loading residents...</h3>
          <p className="text-muted-foreground">Please wait while we fetch your data</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error}
              <Button 
                variant="outline" 
                size="sm" 
                className="ml-4"
                onClick={onRetry}
              >
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="mb-4 text-sm text-muted-foreground">
          Showing {Math.min(filteredResidents.length, pageSize)} of {filteredResidents.length} residents
        </div>
        
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Account #</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Property</TableHead>
                <TableHead>Unit</TableHead>
                <TableHead>Association</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Primary</TableHead>
                <TableHead>Move In</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentPageData.length === 0 ? (
                <TableRow>
                  <TableCell 
                    colSpan={10} 
                    className="text-center py-8 text-muted-foreground"
                  >
                    No residents found matching your criteria
                  </TableCell>
                </TableRow>
              ) : (
                currentPageData.map((resident) => (
                  <TableRow key={resident.id}>
                    <TableCell className="font-mono text-sm">
                      {resident.account_number || '-'}
                    </TableCell>
                    <TableCell className="font-medium">
                      {resident.name || '-'}
                    </TableCell>
                    <TableCell>{resident.email || '-'}</TableCell>
                    <TableCell>{resident.phone || '-'}</TableCell>
                    <TableCell>
                      {resident.property?.address ? 
                        extractStreetAddress(resident.property.address) : 
                        '-'
                      }
                    </TableCell>
                    <TableCell>{resident.property?.unit_number || '-'}</TableCell>
                    <TableCell>{resident.association?.name || '-'}</TableCell>
                    <TableCell>
                      <Badge variant={getTypeBadge(resident.resident_type)}>
                        {resident.resident_type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {resident.is_primary ? (
                        <Badge variant="default">Primary</Badge>
                      ) : (
                        <Badge variant="outline">Secondary</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {resident.move_in_date ? 
                        new Date(resident.move_in_date).toLocaleDateString() : 
                        '-'
                      }
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <ResidentPagination
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          totalItems={filteredResidents.length}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
        />
      </CardContent>
    </Card>
  );
};

export default ResidentTable;
