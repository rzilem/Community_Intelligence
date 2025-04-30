
import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/date-utils';
import { LoadingState } from '@/components/ui/loading-state';
import HomeownerPagination from './HomeownerPagination';

interface HomeownerTableProps {
  loading: boolean;
  filteredHomeowners: any[];
  visibleColumnIds: string[];
  extractStreetAddress: (address: string | undefined) => string;
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
  const navigate = useNavigate();

  // Calculate pagination
  const totalPages = Math.max(1, Math.ceil(filteredHomeowners.length / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, filteredHomeowners.length);
  const paginatedHomeowners = filteredHomeowners.slice(startIndex, endIndex);

  if (loading) {
    return <LoadingState text="Loading owners..." />;
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {visibleColumnIds.includes('name') && <TableHead>Name</TableHead>}
              {visibleColumnIds.includes('email') && <TableHead>Email</TableHead>}
              {visibleColumnIds.includes('propertyAddress') && <TableHead>Street Address</TableHead>}
              {visibleColumnIds.includes('association') && <TableHead>Association</TableHead>}
              {visibleColumnIds.includes('status') && <TableHead>Status</TableHead>}
              {visibleColumnIds.includes('type') && <TableHead>Type</TableHead>}
              {visibleColumnIds.includes('lastPaymentDate') && <TableHead>Last Payment Date</TableHead>}
              {visibleColumnIds.includes('closingDate') && <TableHead>Closing Date</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedHomeowners.length === 0 ? (
              <TableRow>
                <TableCell colSpan={visibleColumnIds.length} className="text-center h-24 text-muted-foreground">
                  {allResidentsCount > 0 
                    ? "No homeowners found matching your search criteria."
                    : "No homeowners found. Try selecting a different association or importing homeowner data."}
                </TableCell>
              </TableRow>
            ) : (
              paginatedHomeowners.map(homeowner => (
                <TableRow key={homeowner.id} className="group">
                  {visibleColumnIds.includes('name') && (
                    <TableCell className="font-medium">
                      <span 
                        className="cursor-pointer hover:text-primary hover:underline"
                        onClick={() => navigate(`/homeowners/${homeowner.id}`)}
                      >
                        {homeowner.name}
                      </span>
                    </TableCell>
                  )}
                  {visibleColumnIds.includes('email') && (
                    <TableCell>{homeowner.email}</TableCell>
                  )}
                  {visibleColumnIds.includes('propertyAddress') && (
                    <TableCell>
                      <span 
                        className="cursor-pointer hover:text-primary hover:underline"
                        onClick={() => navigate(`/homeowners/${homeowner.id}`)}
                      >
                        {extractStreetAddress(homeowner.propertyAddress)}
                      </span>
                    </TableCell>
                  )}
                  {visibleColumnIds.includes('association') && (
                    <TableCell className="text-muted-foreground truncate max-w-[200px]">
                      {homeowner.associationName}
                    </TableCell>
                  )}
                  {visibleColumnIds.includes('status') && (
                    <TableCell>
                      <Badge 
                        variant={homeowner.status === 'active' ? 'default' : 'outline'} 
                        className={homeowner.status === 'inactive' ? 'bg-gray-100 text-gray-800' : ''}
                      >
                        {homeowner.status === 'active' ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                  )}
                  {visibleColumnIds.includes('type') && (
                    <TableCell>
                      {homeowner.type === 'owner' ? 'Owner' : 
                       homeowner.type === 'tenant' ? 'Tenant' : 
                       homeowner.type === 'family' ? 'Family Member' : 
                       homeowner.type}
                    </TableCell>
                  )}
                  {visibleColumnIds.includes('lastPaymentDate') && (
                    <TableCell>
                      {homeowner.lastPayment ? 
                        formatDate(homeowner.lastPayment.date) : 
                        '-'}
                    </TableCell>
                  )}
                  {visibleColumnIds.includes('closingDate') && (
                    <TableCell>
                      {homeowner.closingDate ? 
                        formatDate(homeowner.closingDate) : 
                        '-'}
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      <HomeownerPagination
        filteredCount={paginatedHomeowners.length}
        totalCount={allResidentsCount}
        currentPage={currentPage}
        totalPages={totalPages}
        pageSize={pageSize}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
      />
    </>
  );
};

export default HomeownerTable;
