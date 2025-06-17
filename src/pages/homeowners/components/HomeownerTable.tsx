
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
import { Homeowner } from '../homeowner-types';
import HomeownerPagination from './HomeownerPagination';

interface HomeownerTableProps {
  loading: boolean;
  filteredHomeowners: Homeowner[];
  visibleColumnIds: string[];
  extractStreetAddress: (address: string) => string;
  allResidentsCount: number;
  error: string | null;
  onRetry: () => void;
  currentPage: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

const HomeownerTable: React.FC<HomeownerTableProps> = ({
  loading,
  filteredHomeowners,
  visibleColumnIds,
  extractStreetAddress,
  allResidentsCount,
  error,
  onRetry,
  currentPage,
  pageSize,
  onPageChange,
  onPageSizeChange
}) => {
  // Calculate pagination
  const totalPages = Math.ceil(filteredHomeowners.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentPageData = filteredHomeowners.slice(startIndex, endIndex);

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      'active': 'default',
      'inactive': 'secondary',
      'pending-approval': 'outline'
    };
    return variants[status] || 'outline';
  };

  const getTypeBadge = (type: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      'owner': 'default',
      'tenant': 'secondary',
      'family-member': 'outline'
    };
    return variants[type] || 'outline';
  };

  const formatCurrency = (amount?: number) => {
    if (typeof amount !== 'number') return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 flex flex-col items-center justify-center min-h-[400px]">
          <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
          <h3 className="text-lg font-medium">Loading homeowners...</h3>
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
          Showing {Math.min(filteredHomeowners.length, pageSize)} of {filteredHomeowners.length} homeowners
          {allResidentsCount > 0 && ` (${allResidentsCount} total in database)`}
        </div>
        
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                {visibleColumnIds.includes('account') && (
                  <TableHead>Account #</TableHead>
                )}
                {visibleColumnIds.includes('name') && (
                  <TableHead>Name</TableHead>
                )}
                {visibleColumnIds.includes('email') && (
                  <TableHead>Email</TableHead>
                )}
                {visibleColumnIds.includes('phone') && (
                  <TableHead>Phone</TableHead>
                )}
                {visibleColumnIds.includes('property') && (
                  <TableHead>Property</TableHead>
                )}
                {visibleColumnIds.includes('unit') && (
                  <TableHead>Unit</TableHead>
                )}
                {visibleColumnIds.includes('association') && (
                  <TableHead>Association</TableHead>
                )}
                {visibleColumnIds.includes('type') && (
                  <TableHead>Type</TableHead>
                )}
                {visibleColumnIds.includes('status') && (
                  <TableHead>Status</TableHead>
                )}
                {visibleColumnIds.includes('balance') && (
                  <TableHead>Balance</TableHead>
                )}
                {visibleColumnIds.includes('moveInDate') && (
                  <TableHead>Move In</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentPageData.length === 0 ? (
                <TableRow>
                  <TableCell 
                    colSpan={visibleColumnIds.length} 
                    className="text-center py-8 text-muted-foreground"
                  >
                    No homeowners found matching your criteria
                  </TableCell>
                </TableRow>
              ) : (
                currentPageData.map((homeowner) => (
                  <TableRow key={homeowner.id}>
                    {visibleColumnIds.includes('account') && (
                      <TableCell className="font-mono text-sm">
                        {homeowner.id}
                      </TableCell>
                    )}
                    {visibleColumnIds.includes('name') && (
                      <TableCell className="font-medium">
                        {homeowner.name}
                      </TableCell>
                    )}
                    {visibleColumnIds.includes('email') && (
                      <TableCell>{homeowner.email}</TableCell>
                    )}
                    {visibleColumnIds.includes('phone') && (
                      <TableCell>{homeowner.phone}</TableCell>
                    )}
                    {visibleColumnIds.includes('property') && (
                      <TableCell>
                        {extractStreetAddress(homeowner.propertyAddress)}
                      </TableCell>
                    )}
                    {visibleColumnIds.includes('unit') && (
                      <TableCell>{homeowner.unitNumber || '-'}</TableCell>
                    )}
                    {visibleColumnIds.includes('association') && (
                      <TableCell>{homeowner.association}</TableCell>
                    )}
                    {visibleColumnIds.includes('type') && (
                      <TableCell>
                        <Badge variant={getTypeBadge(homeowner.type)}>
                          {homeowner.type.replace('-', ' ')}
                        </Badge>
                      </TableCell>
                    )}
                    {visibleColumnIds.includes('status') && (
                      <TableCell>
                        <Badge variant={getStatusBadge(homeowner.status)}>
                          {homeowner.status.replace('-', ' ')}
                        </Badge>
                      </TableCell>
                    )}
                    {visibleColumnIds.includes('balance') && (
                      <TableCell className="font-mono">
                        {formatCurrency(homeowner.balance)}
                      </TableCell>
                    )}
                    {visibleColumnIds.includes('moveInDate') && (
                      <TableCell>
                        {homeowner.moveInDate ? 
                          new Date(homeowner.moveInDate).toLocaleDateString() : 
                          '-'
                        }
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <HomeownerPagination
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          totalItems={filteredHomeowners.length}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
        />
      </CardContent>
    </Card>
  );
};

export default HomeownerTable;
