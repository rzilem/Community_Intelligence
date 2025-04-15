
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import HomeownerPagination from '@/pages/homeowners/components/HomeownerPagination';

interface ResidentTableProps {
  loading: boolean;
  residents: any[];
  totalCount: number;
  currentPage: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

const ResidentTable: React.FC<ResidentTableProps> = ({
  loading,
  residents,
  totalCount,
  currentPage,
  pageSize,
  onPageChange,
  onPageSizeChange
}) => {
  // Calculate pagination values
  const startIdx = (currentPage - 1) * pageSize;
  const endIdx = Math.min(startIdx + pageSize, residents.length);
  const currentPageItems = residents.slice(startIdx, endIdx);
  const totalPages = Math.ceil(residents.length / pageSize);

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton key={index} className="h-10 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="border rounded-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-sm">Name</th>
              <th className="px-4 py-3 text-left font-medium text-sm">Email</th>
              <th className="px-4 py-3 text-left font-medium text-sm">Property</th>
              <th className="px-4 py-3 text-left font-medium text-sm">Association</th>
              <th className="px-4 py-3 text-left font-medium text-sm">Type</th>
              <th className="px-4 py-3 text-left font-medium text-sm">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {currentPageItems.length > 0 ? (
              currentPageItems.map((resident) => (
                <tr key={resident.id} className="hover:bg-muted/50">
                  <td className="px-4 py-3">{resident.name}</td>
                  <td className="px-4 py-3">{resident.email}</td>
                  <td className="px-4 py-3">{resident.propertyAddress}</td>
                  <td className="px-4 py-3">{resident.association}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      resident.type === 'owner' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {resident.type}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      resident.status === 'active' ? 'bg-green-100 text-green-800' : 
                      resident.status === 'inactive' ? 'bg-gray-100 text-gray-800' : 
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {resident.status}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                  No residents found matching your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <HomeownerPagination
        filteredCount={residents.length}
        totalCount={totalCount}
        currentPage={currentPage}
        totalPages={totalPages}
        pageSize={pageSize}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
      />
    </div>
  );
};

export default ResidentTable;
